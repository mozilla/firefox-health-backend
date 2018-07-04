import Router from 'koa-router';
import json2csv from 'json2csv';
import moment from 'moment';
import chrono from 'chrono-node';
import _ from 'lodash/fp';
import { stringify } from 'query-string';
import { median, quantile } from 'simple-statistics';
import { getEvolution, getLatestEvolution } from './perf/tmo';
import fetchSpeedometerData from './perf/speedometer';
import { fetchTelemetryEvolution } from './perf/tmo-wrapper';
import fetchJson from './fetch/json';
import channels from './release/channels';
import getVersions from './release/versions';
import { getReleaseDate } from './release/history';
import { sanitize } from './meta/version';
import getCalendar from './release/calendar';
import { getSpreadsheetValues } from './utils/google';
import config from './configuration';
// Project Dawn
// channels.splice(2, 1);

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

const summaryKeys = ['p50', 'p95', 'submissions', 'count'];

const windowRadius = 7;

const averageEvolution = (evolution) => {
  evolution.forEach((summary, idx) => {
    summaryKeys.forEach((key) => {
      const windo = evolution
        .slice(Math.max(0, idx - windowRadius), idx + windowRadius + 1)
        .map(entry => entry[key]);
      summary[`${key}Avg`] = median(windo);
    });
  });
  return evolution;
};

const summarizeIpcTable = async (metric) => {
  const evolutions = await getLatestEvolution({
    metric,
    channel: 'nightly',
    application: 'Firefox',
  });
  return evolutions
    .filter(({ evolution }) => evolution)
    .map(({ key, evolution }) => {
      const lastDate = moment().add(-1, 'days').toDate();
      const firstDate = moment(lastDate).add(-7, 'days').toDate();
      const range = evolution.dateRange(firstDate, lastDate);
      if (!range) {
        return null;
      }
      const hist = range.histogram();
      return {
        key,
        count: hist.count,
        submissions: hist.submissions,
        mean: hist.mean(),
        median: hist.percentile(50),
      };
    })
    .filter(row => row);
};

let notesCache = null;

router
  .get('/notes', async (ctx) => {
    if (process.env.GOOGLE_API_KEY) {
      if (!notesCache) {
        console.log('Fetching notes since it is not in the cache.');
        notesCache = (await getSpreadsheetValues({
          id: config.quantumSpreadsheetId,
          range: 'Status!A1:F30',
        })).reduce((hash, note) => {
          hash[note.id] = note;
          return hash;
        }, {});

        setTimeout(() => {
          notesCache = null;
        }, process.env.NODE_ENV === 'production' ? 1000 * 60 * 5 : 1000 * 60);
      }
      ctx.body = notesCache;
    } else {
      ctx.throw(
        400,
        'You need to set the GOOGLE_API_KEY for this endpoint to work. More info in ' +
        `${config.repoUrl}/blob/master/README.md`,
      );
    }
  })
  .get('/benchmark/startup', async (ctx) => {
    const list = await getSpreadsheetValues({
      id: config.quantumSpreadsheetId,
      range: 'startup!A1:E200',
    });
    list.forEach((entry) => {
      entry.date = moment(chrono.parseDate(entry.date)).valueOf();
      entry.firstPaint = parseFloat(entry.firstPaint);
      entry.heroElement = parseFloat(entry.heroElement);
    });
    ctx.body = list;
  })
  .get('/benchmark/pageload', async (ctx) => {
    const list = await getSpreadsheetValues({
      id: config.quantumSpreadsheetId,
      range: 'pageLoad!A1:F300',
    });
    const ids = _.uniq(_.pluck('id', list));
    list.forEach((entry) => {
      entry.id = ids.indexOf(entry.id);
      entry.date = moment(chrono.parseDate(entry.date)).valueOf();
      entry.firstPaint = parseFloat(entry.firstPaint);
      entry.heroElement = parseFloat(entry.heroElement);
    });
    ctx.body = list;
  })
  .get('/benchmark/hasal', async (ctx) => {
    const list = (await getSpreadsheetValues({
      id: config.quantumSpreadsheetId,
      range: 'hasal!A1:F300',
    })).filter(entry => entry.diff != null);
    const ids = _.uniq(_.pluck('id', list));
    list.forEach((entry) => {
      entry.id = ids.indexOf(entry.id);
      entry.date = moment(chrono.parseDate(entry.date)).valueOf();
      entry.diff = parseFloat(entry.diff);
    });
    ctx.body = list;
  })
  .get('/benchmark/speedometer', async (ctx) => {
    try {
      ctx.body = await fetchSpeedometerData(ctx.request.query);
    } catch (e) {
      if (e.name === 'Error') {
        // Keep track of the issue on the backend logs
        console.warn(e.message);
        // This is an error from the caller
        ctx.throw(400, e);
      } else {
        // Re-throwing the error will allow seeing in the backend
        // the actual issue
        throw (e);
      }
    }
    // ctx.body = await fetchSpeedometerData(ctx.request.query);
  })
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
  .get('/version-evolutions', async (ctx) => {
    const query = ctx.request.query;
    const { metric } = query;
    delete query.metric;
    const channelVersions = await getVersions();
    const calendar = await getCalendar();
    const start = parseInt(channelVersions.nightly, 10);
    const oldestRelease = start - 3;
    const versions = [];
    const nightlyToRelease = channels.slice().reverse();
    let endDate = null;
    let oldestNightlyStart = null;
    const channelDates = [];
    for (let version = start; version >= start - 5; version -= 1) {
      const evolutions = await Promise.all(nightlyToRelease.map((channel) => {
        if (version > parseInt(channelVersions[channel], 10) || (version > 55 && channel === 1)) {
          return null;
        }
        return getEvolution(Object.assign({}, {
          metric,
          channel,
          filters: query,
          useSubmissionDate: channel !== 'nightly' && channel !== 'aurora',
          version,
        }));
      }));
      if (!evolutions[0]) {
        if (version === start) {
          // eslint-disable-next-line
          continue;
        }
      }
      if (channelDates.length) {
        nightlyToRelease.forEach((channel, channelIdx) => {
          if (!evolutions[channelIdx] || !channelDates[channelIdx]) {
            return;
          }
          evolutions[channelIdx] = evolutions[channelIdx].dateRange(
            oldestNightlyStart || evolutions[channelIdx].dates()[0],
            channelDates[channelIdx],
          );
          if (evolutions[channelIdx] && !evolutions[channelIdx].dates().length) {
            evolutions[channelIdx] = null;
          }
        });
      }
      nightlyToRelease.forEach((channel, channelIdx) => {
        if (!evolutions[channelIdx]) {
          return;
        }
        channelDates[channelIdx] = evolutions[channelIdx].dates()[0];
      });
      if (oldestRelease === version) {
        oldestNightlyStart = channelDates[0];
      }
      const nightlyDate = moment(evolutions.find(evolution => evolution).dates()[0]).format('YYYY-MM-DD');
      const versionStr = sanitize(version);
      let releaseDate = (await getReleaseDate(versionStr)).date;
      if (!releaseDate) {
        const planned = calendar.find(release => release.version === versionStr);
        if (planned) {
          releaseDate = planned.date;
        }
      }
      versions.push({
        version: versionStr,
        start: nightlyDate,
        release: releaseDate,
        end: endDate,
        channels: nightlyToRelease.map((channel, i) => {
          if (!evolutions[i]) {
            return null;
          }
          const submissionsAvg = median(evolutions[i].map(date => date.submissions));
          const countAvg = median(evolutions[i].map(date => date.count));
          const cutoff = submissionsAvg * 0.5;
          const dates = averageEvolution(evolutions[i]
            .map((histogram, j, date) => {
              if (histogram.submissions < cutoff) {
                return null;
              }
              return Object.assign(summarizeHistogram(histogram), {
                date: moment(date).format('YYYY-MM-DD'),
              });
            })
            .filter(entry => entry && entry.p50));
          return {
            channel,
            submissionsAvg,
            countAvg,
            dates,
          };
        }),
      });
      endDate = releaseDate;
    }

    ctx.body = versions;
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
  })
  .get('/ipc', async (ctx) => {
    const summary = await summarizeIpcTable('IPC_SYNC_MAIN_LATENCY_MS');
    ctx.body = json2csv({ data: summary });
  })
  .get('/ipc/write', async (ctx) => {
    const summary = await summarizeIpcTable('IPC_WRITE_MAIN_THREAD_LATENCY_MS');
    ctx.body = json2csv({ data: summary });
  })
  .get('/ipc/read', async (ctx) => {
    const summary = await summarizeIpcTable('IPC_READ_MAIN_THREAD_LATENCY_MS');
    ctx.body = json2csv({ data: summary });
  })
  .get('/ipc/mm', async (ctx) => {
    const summary = await summarizeIpcTable('IPC_SYNC_MESSAGE_MANAGER_LATENCY_MS');
    ctx.body = json2csv({ data: summary });
  });
