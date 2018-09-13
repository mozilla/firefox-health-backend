/* This module produces the data needed for the api/android/nimbledroid endpoint
 * The data can either be in Redis or in-memory
 */
import asyncRedis from 'async-redis';

const client = asyncRedis.createClient(process.env.REDIS_URL);

const optimizedData = (data, packageId) => {
  const newData = {};
  data.forEach(({ added, profiles }) => {
    // eslint-disable-next-line camelcase
    profiles.forEach(({ scenario_name, status, time_in_ms }) => {
      if (!newData[scenario_name]) {
        newData[scenario_name] = [];
      }
      newData[scenario_name].push({
        date: added,
        ms: time_in_ms,
      });
    });
  });
  return { [packageId]: newData };
};

const queryNimbledroidData = async (product, version) => {
  const cachedKeys = await client.keys(`cache:*nimble*${product}/apks/*`);
  const data = await Promise.all(cachedKeys.map(async key =>
    JSON.parse(await client.get(key))));
  if (data.length === 0) {
    throw Error('The script that fetches data should have run before hitting the API.');
  }
  return version === '2' ? optimizedData(data, product) : data;
};

export default queryNimbledroidData;
