import Router from 'koa-router';
import queryNimbledroidData from '../utils/apis/queryNimbledroidData';
import config from '../configuration';

const README_URL = `${config.repoUrl}/blob/master/README.md`;

export const router = new Router();

router
  .get('/nimbledroid', async (ctx) => {
    if (!process.env.NIMBLEDROID_API_KEY || !process.env.NIMBLEDROID_EMAIL) {
      ctx.throw(
        400,
        'You need to set Nimbledroid authentication for this endpoint to work. '
        + `More info in ${README_URL}`,
      );
    }
    if (!process.env.REDIS_URL) {
      ctx.throw(
        400,
        'You need to run Redis for this endpoint to work. '
        + `More info in ${README_URL}`,
      );
    }
    const { product } = ctx.request.query;
    if (!product) {
      ctx.throw(
        400,
        'You need to call this endpoint with ?product=<klar|focus>.',
      );
    }
    ctx.body = await queryNimbledroidData(product);
  });
