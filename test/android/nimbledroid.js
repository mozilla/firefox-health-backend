/* global afterEach describe, it */
import fetchMock from 'fetch-mock';
import superagent from 'supertest';
import app from '../../src/app';
import config from '../../src/configuration';

const KLAR_DATA = require('../mocks/nimbledroidKlar');

const request = () => superagent(app.listen());

describe('/android', () => {
  const product = 'klar';
  fetchMock.get(`${config.nimbledroidApiUrl}.${product}/apks`, KLAR_DATA);

  describe('GET /api/android/nimbledroid/', () => {
    it('should return 400', (done) => {
      delete process.env.NIMBLEDROID_EMAIL;
      request()
        .get('/api/android/nimbledroid/')
        .expect(400, done);
    });

    it('should return 400', (done) => {
      request()
        .get('/api/android/nimbledroid/')
        .expect(400, done);
    });

    it('should return 200', (done) => {
      request()
        .get(`/api/android/nimbledroid/?product=${product}`)
        .expect(200, done);
    });

    afterEach(() => {
      process.env.NIMBLEDROID_EMAIL = 'nobody@moz.com';
      process.env.NIMBLEDROID_API_KEY = 'foo_bar';
    });
  });
});
