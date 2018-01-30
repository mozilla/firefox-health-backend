import dotenv from 'dotenv';
import http from 'http';
// import logger from 'koa-logger';
import responseTime from 'koa-response-time';
import Router from 'koa-router';
import cors from 'koa-cors';
import Koa from 'koa';
import { createClient } from 'then-redis';

dotenv.config();

/* eslint-disable import/first */
import { router as release } from './release';
import { router as crashes } from './crashes';
import { router as bz } from './bz';
import { router as status } from './status';
import { router as perf } from './perf';
/* eslint-enable import/first */

const version = require('../package.json').version;

const app = new Koa();

// app.use(logger());
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

api.use('/release', release.routes());
api.use('/crashes', crashes.routes());
api.use('/bz', bz.routes());
api.use('/status', status.routes());
api.use('/perf', perf.routes());

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

app.use(async (ctx) => {
  ctx.body = 'Welcome to Firefox health\'s backend!';
});

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app.callback());
  server.on('listening', () => {
    const { address, port } = server.address();
    // eslint-disable-next-line
    console.log('http://%s:%d/ in %s', address, port, process.env.NODE_ENV || 'dev');
  });
  // A different port number than the frontend repo
  server.listen(process.env.PORT || 3000);
}

export default app;
