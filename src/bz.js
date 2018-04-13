import Router from 'koa-router';
import moment from 'moment';
import _ from 'lodash/fp';
import { stringify } from 'qs';
import fetchJson from './fetch/json';
import { getRelease } from './bz/release';
// import { getHistory } from './release/history';
// import { getMissedCount } from './bz/regressions';

export const router = new Router();

router

  .get('/burnup', async (ctx) => {
    const { whiteboard, list } = ctx.request.query;
    const base = 'https://bugzilla.mozilla.org/rest/bug';
    const query = stringify({
      whiteboard,
      include_fields: [
        'id',
        'is_open',
        'status',
        'creation_time',
        'last_change_time',
        'cf_last_resolved',
        'assigned_to',
        'flags',
        'whiteboard',
      ].join(','),
    });
    const { bugs } = await fetchJson(`${base}?${query}`, { ttl: 'day' });
    if (list) {
      return ctx.body = bugs;
    }
    const bydate = bugs.map((bug) => {
      const set = {
        id: bug.id,
        total: moment(bug.creation_time, 'YYYY-MM-DD').valueOf(),
      };
      if (bug.status === 'resolved' || bug.status === 'verified' && bug.status === 'closed') {
        set.closed = moment(bug.cf_last_resolved || bug.last_change_time, 'YYYY-MM-DD').valueOf();
        set.status = bug.status;
      } else if (bug.whiteboard.match('\\bqf:needs-analysis\\b')) {
        set.needsAnalysis = moment(bug.last_change_time, 'YYYY-MM-DD').valueOf();
      } else if (bug.whiteboard.match('\\bqf:analyzed\\b')) {
        set.analyzed = moment(bug.last_change_time, 'YYYY-MM-DD').valueOf();
      }
      return set;
    });
    const buckets = {
      closed: [],
      total: [],
      needsAnalysis: [],
      analyzed: [],
    };
    const uniqueDates = [];
    bydate.forEach((bug) => {
      for (const key in buckets) {
        const date = bug[key];
        if (date) {
          const bucket = buckets[key];
          let pairs = bucket.find(([needle]) => needle === date);
          if (!pairs) {
            if (!uniqueDates.includes(date)) {
              uniqueDates.push(date);
            }
            pairs = [date, []];
            bucket.push(pairs);
          }
          pairs[1].push(bug.id);
        }
      }
    });
    uniqueDates.sort().reverse();

    const needsAnalysisIds = bydate.filter(bug => bug.needsAnalysis).map(bug => bug.id);
    const analyzedIds = bydate.filter(bug => bug.analyzed).map(bug => bug.id);
    const closedIds = bydate.filter(bug => bug.closed).map(bug => bug.id);

    const countChanged = (bucket, date) => {
      const pairs = buckets[bucket].find(([needle]) => needle === date);
      return pairs ? pairs[1].length : 0;
    };

    let totalPointer = bydate.length;
    let closedPointer = closedIds.length;
    let needsAnalysisPointer = needsAnalysisIds.length;
    let analyzedPointer = analyzedIds.length;

    const timeline = uniqueDates.map((date) => {
      totalPointer -= countChanged('total', date);
      closedPointer -= countChanged('closed', date);
      needsAnalysisPointer -= countChanged('needsAnalysis', date);
      analyzedPointer -= countChanged('analyzed', date);

      return {
        date,
        total: totalPointer,
        closed: closedPointer,
        needsAnalysis: needsAnalysisPointer,
        analyzed: analyzedPointer,
      };
    });

    ctx.body = timeline;
    return ctx.body;
  })

  .get('/status', async (ctx) => {
    const { ids } = ctx.request.query;
    ctx.body = await getRelease(ids);
  })

  .get('/regressions/missed', async (ctx) => {
    // const history = await getHistory({
    //   major: true,
    //   tailVersion: 5,
    // });
    // history.reverse();
    // const counts = await Promise.all(
    //   history.map((release) => {
    //     const version = release.version;
    //     return getMissedCount(version, release.date);
    //   })
    // );
    ctx.body = [
      { count: 86, version: 40 },
      { count: 93, version: 41 },
      { count: 109, version: 42 },
      { count: 92, version: 43 },
      { count: 87, version: 44 },
      { count: 76, version: 45 },
      { count: 0, version: 46 },
      { count: 0, version: 47 },
    ];
    // counts.map(({ count, query }, idx) => {
    //   return {
    //     count,
    //     query,
    //     version: history[idx].version,
    //   };
    // });
  });
