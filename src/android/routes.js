import Router from 'koa-router';
import { getSpreadsheetValues } from '../utils/google';
import config from '../configuration';

export const router = new Router();

router
  .get('/klar', async (ctx) => {
    const { site } = ctx.request.query;
    const list = await getSpreadsheetValues({
      id: config.androidSpreadsheetId,
      range: site,
    });
    list.forEach((entry) => {
      entry.focus = parseFloat(entry.focus);
      entry.klar = parseFloat(entry.klar);
    });
    ctx.body = list;
  });
