/* global fetch */
import asyncRedis from 'async-redis';
// This is important for being able to use 'fetch-mock' in tests
// I also switch from node-fetch to isomorphic-fetch to make it work
// both on node (test run) and the browser (loading the API)
// Read 'fetch is assigned to a local variable, not a global'
// http://www.wheresrhys.co.uk/fetch-mock/troubleshooting
import 'isomorphic-fetch';
import moment from 'moment';

const defaultTtl = moment.duration(8, 'hours').as('seconds');

let db = null;
const devCache = {};

const fetchCall = async (url, { headers = {}, method = 'get' } = {}) => {
  const response = await fetch(url, { method, headers });
  if (!response.ok) {
    console.error(`Response for ${url} not OK: ${response.status}`);
    return null;
  }
  return response.text();
};

const storeInRedis = async (key, value, { ttl = defaultTtl }) => {
  if (typeof ttl === 'string') {
    ttl = moment.duration(1, ttl).as('seconds');
  }
  await db.set(key, value);
  await db.expire(key, ttl);
};

const redisFetch = async (url, options) => {
  const key = `cache:${url}`;
  if (!db) {
    db = asyncRedis.createClient(process.env.REDIS_URL);
  }
  const cached = await db.get(key);
  if (cached) {
    return cached;
  }
  const text = await fetchCall(url, options);
  if (text) {
    await storeInRedis(key, text, options);
  }
  return text;
};

const inMemoryFetch = (url, options) => {
  const key = `cache:${url}`;
  const cached = devCache[key];
  if (cached) {
    return cached;
  }
  return fetchCall(url, options);
};

const fetchText = async (url, options = {}) => {
  let text;
  if (process.env.REDIS_URL && db) {
    try {
      text = redisFetch(url, options);
    } catch (e) {
      console.error(e);
    }
  } else {
    text = inMemoryFetch(url, options);
  }
  return text;
};

export default fetchText;
