/* This module produces the data needed for the api/android/nimbledroid endpoint
 * The data can either be in Redis or in-memory
 */
import asyncRedis from 'async-redis';

const client = asyncRedis.createClient(process.env.REDIS_URL);

const latest = (a, b) => {
  let latestVersion = a;
  let n = 0;
  while (n <= a.length - 1 && latestVersion === a) {
    if (a[n] < b[n]) {
      latestVersion = b;
    } else {
      break;
    }
    n += 1;
  }
  return latestVersion;
};

const processedData = (data, packageId) => {
  let latestVersion = ['0', '0', '0', '0'];
  const scenarios = {};
  // eslint-disable-next-line camelcase
  data.forEach(({ added, profiles, version_name }) => {
    latestVersion = latest(latestVersion, version_name.split('.'));
    // eslint-disable-next-line camelcase
    profiles.forEach(({ scenario_name, time_in_ms }) => {
      if (!scenarios[scenario_name]) {
        scenarios[scenario_name] = [];
      }
      scenarios[scenario_name].push({
        date: added,
        ms: time_in_ms,
      });
    });
  });
  return {
    meta: {
      latestVersion: latestVersion.join('.'),
      packageId,
    },
    scenarios,
  };
};

const queryNimbledroidData = async (product) => {
  const cachedKeys = await client.keys(`cache:*nimble*${product}/apks/*`);
  const data = await Promise.all(cachedKeys.map(async key => JSON.parse(await client.get(key))));
  if (data.length === 0) {
    throw Error('The script that fetches data should have run before hitting the API.');
  }
  return processedData(data, product);
};

export default queryNimbledroidData;
