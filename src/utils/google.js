import moment from 'moment';
import fetchJson from '../fetch/json';

export const getSpreadsheetValues = async ({ id, range }) => {
  const sheetsAPI = 'https://sheets.googleapis.com/v4/spreadsheets';
  const authKey = process.env.GOOGLE_API_KEY;
  if (!authKey) {
    console.error('The server was started without setting the GOOGLE_API_KEY');
    return [];
  }

  const url = `${sheetsAPI}/${id}/values/${range}?key=${authKey}`;
  const { values } = await fetchJson(url);
  const headers = values.splice(0, 1).pop();

  return values.reduce((criteria, entry) => {
    const obj = {};
    headers.forEach((header, idx) => {
      if (header.charAt(0) !== '_' && entry[idx]) {
        obj[header] = entry[idx];
        if (header === 'date') {
          obj[header] = moment(obj[header]).format('YYYY-MM-DD');
        }
      }
    });
    criteria.push(obj);
    return criteria;
  }, []);
};
