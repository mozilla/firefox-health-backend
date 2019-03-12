import Router from 'koa-router';
import moment from 'moment';
import { stringify } from 'query-string';
import { median, quantile } from 'simple-statistics';
import { getLatestEvolution } from './perf/tmo';
import { fetchTelemetryEvolution } from './perf/tmo-wrapper';
import fetchJson from './fetch/json';

export const router = new Router();

const summarizeHistogram = (hist) => {
  if (!hist.mean) {
    console.error('Unexpected histogram', hist);
    return null;
  }
  return {
    p50: hist.percentile(50),
    p95: hist.percentile(95),
    submissions: hist.submissions,
    count: hist.count,
  };
};

router
  .get('/herder', async (ctx) => {
    const { framework } = ctx.request.query;
    let { signatures } = ctx.request.query;
    if (!Array.isArray(signatures)) {
      signatures = [signatures];
    }
    const data = await fetchJson(
      `https://treeherder.mozilla.org/api/project/mozilla-central/performance/data/?${stringify({
        framework: framework != null ? framework : 1,
        interval: 31536000 / 12 * 4,
        signatures,
      })}`,
      { ttl: 'day' },
    );
    ctx.body = signatures.map((current) => {
      if (!data[current]) {
        // console.error('Could not load %s', current);
        return null;
      }
      const series = data[current].reduce((reduced, entry) => {
        const date = moment(entry.push_timestamp * 1000).format('YYYY-MM-DD');
        let found = reduced.find(needle => needle.date === date);
        if (!found) {
          found = {
            runs: [],
            value: entry.value,
            avg: entry.value,
            date,
          };
          reduced.push(found);
        }
        found.runs.push({
          time: entry.push_timestamp,
          value: entry.value,
        });
        return reduced;
      }, []);
      series.forEach((serie) => {
        serie.value = median(serie.runs.map(entry => entry.value));
        serie.time = median(serie.runs.map(entry => entry.time));
      });
      const runs = series.reduce((all, entry) => all.concat(entry.runs), []);
      // const md = median(values);
      // const sd = standardDeviation(values);
      const slice = 60 * 60 * 24 * 7;
      series.forEach((entry) => {
        const now = entry.runs[0].time;
        const sliced = runs
          .filter(check => check.time > now - slice && check.time < now + slice)
          .map(check => check.value);
        entry.avg = median(sliced);
        entry.q1 = quantile(sliced, 0.75);
        entry.q3 = quantile(sliced, 0.25);
      });
      return series;
    });
  })
  .get('/telemetry', async (ctx) => {
    const query = ctx.request.query;
    const { name } = ctx.request.query;
    delete query.name;
    await fetchTelemetryEvolution(ctx, name, query);
  })
  .get('/tracking', async (ctx) => {
    const opts = ctx.request.query;
    const evolution = await getLatestEvolution(opts);
    if (!evolution) {
      ctx.body = { status: 0 };
      return;
    }
    const histogram = evolution.histogram();
    ctx.body = summarizeHistogram(histogram);
  });
