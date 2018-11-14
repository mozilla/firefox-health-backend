import Router from 'koa-router';
import getVersions from './release/versions';

export const router = new Router();

router

  .get('/', async (ctx) => {
    ctx.body = await getVersions();
  });
