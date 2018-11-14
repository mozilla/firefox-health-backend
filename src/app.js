import { Z_SYNC_FLUSH } from 'zlib';
import responseTime from 'koa-response-time';
import Router from 'koa-router';
import cors from 'koa-cors';
import Koa from 'koa';
import compress from 'koa-compress';
import { createClient } from 'async-redis';

/* eslint-disable import/first */
import { router as bz } from './bz';
import { router as perf } from './perf';
import { router as android } from './android/routes';
/* eslint-enable import/first */

const version = require('../package.json').version;

const app = new Koa();
app.use(compress({
  // eslint-disable-next-line camelcase
  filter: content_type => /json/i.test(content_type),
  flush: Z_SYNC_FLUSH,
}));

app.use(responseTime());
app.use(cors());

const api = new Router();
api.get('/version', (ctx) => {
  ctx.body = {
    version,
    source: process.env.SOURCE_VERSION || '',
  };
});
api.get('/cache/flush', async (ctx) => {
  const db = createClient(process.env.REDIS_URL);
  const rows = await db.keys('cache:*');
  const flushed = await Promise.all(rows.map(row => db.del(row)));
  await db.quit();
  ctx.body = {
    flushed: flushed.length,
  };
});

api.use('/bz', bz.routes());
api.use('/perf', perf.routes());
api.use('/android', android.routes());

const index = new Router();
index.use('/api', api.routes());
app.use(index.routes());

app.use(async (ctx, next) => {
  const route = ctx.path;
  if (/^\/[a-zA-Z/]*$/.test(route)) {
    ctx.path = '/index.html';
  }
  await next();
  ctx.path = route;
});

export default app;
