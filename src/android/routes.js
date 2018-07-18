import Router from 'koa-router';
import queryNimbledroidData from '../utils/apis/queryNimbledroidData';
import { getSpreadsheetValues } from '../utils/google';
import config from '../configuration';

export const router = new Router();

router
  .get('/klar', async (ctx) => {
    if (!process.env.GOOGLE_API_KEY) {
      ctx.throw(
        500,
        'You need to set the GOOGLE_API_KEY for this endpoint to work. More info in ' +
        'https://github.com/mozilla/firefox-health-backend/blob/master/README.md',
      );
    }
    const { site } = ctx.request.query;
    if (!site) {
      ctx.throw(400, 'You need to call this API by specifying a site parameter.');
    }
    const list = await getSpreadsheetValues({
      id: config.androidSpreadsheetId,
      range: site,
    });
    list.forEach((entry) => {
      entry.focus = parseFloat(entry.focus);
      entry.klar = parseFloat(entry.klar);
    });
    ctx.body = list;
  })
  .get('/nimbledroid', async (ctx) => {
    if (!process.env.NIMBLEDROID_API_KEY || !process.env.NIMBLEDROID_EMAIL) {
      ctx.throw(
        400,
        'You need to set Nimbledroid authentication for this endpoint to work. More info in ' +
        'https://github.com/mozilla/firefox-health-backend/blob/master/README.md',
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
