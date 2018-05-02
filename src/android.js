import Router from 'koa-router';
import moment from 'moment';
import { getSpreadsheetValues, androidSpreadsheetId } from './utilties';

export const router = new Router();

router.get('/klar', async (ctx) => {
  const { site } = ctx.request.query;
  const list = await getSpreadsheetValues({
    id: androidSpreadsheetId,
    range: site,
  });
  list.forEach((entry) => {
    entry.focus = parseFloat(entry.focus);
    entry.klar = parseFloat(entry.klar);
  });
  ctx.body = list;
});
