/* global fetch */
import { createClient } from 'then-redis';
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

export default async function fetchText(
  url,
  { ttl = defaultTtl, headers = {}, method = 'get' } = {},
) {
  const key = `cache:${url}`;
  if (typeof ttl === 'string') {
    ttl = moment.duration(1, ttl).as('seconds');
  }
  if (process.env.REDIS_URL && !db) {
    db = createClient(process.env.REDIS_URL);
  }
  const cached = db ? await db.get(key) : devCache[key];
  if (cached) {
    return cached;
  }
  const response = await fetch(url, { method, headers });
  if (!response.ok) {
    // console.error(`Response for ${url} not OK: ${response.status}`);
    return null;
  }
  const text = await response.text();
  if (process.env.REDIS_URL) {
    db.set(key, text);
    db.expire(key, ttl);
  } else {
    devCache[key] = text;
  }
  return text;
}
