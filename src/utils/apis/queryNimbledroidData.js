/* This module produces the data needed for the api/android/nimbledroid endpoint
 * The data can either be in Redis or in-memory
 */
import asyncRedis from 'async-redis';

const client = asyncRedis.createClient(process.env.REDIS_URL);

const queryNimbledroidData = async (product) => {
  const cachedKeys = await client.keys(`cache:*nimble*${product}/apks/*`);
  const data = await Promise.all(cachedKeys.map(async key =>
    JSON.parse(await client.get(key))));
  if (data.length === 0) {
    throw Error('The script that fetches data should have run before hitting the API.');
  }
  return data;
};

export default queryNimbledroidData;
