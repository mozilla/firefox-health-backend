/* global beforeEach describe, it */
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
    it('No NIMBLEDROID_EMAIL should return 400', (done) => {
      delete process.env.NIMBLEDROID_EMAIL;
      request()
        .get('/api/android/nimbledroid/')
        .expect(400, done);
    });

    it('No REDIS_URL should return 400', (done) => {
      delete process.env.REDIS_URL;
      request()
        .get('/api/android/nimbledroid/')
        .expect(400, done);
    });

    it('No ?product=<foo> should return 400', (done) => {
      request()
        .get('/api/android/nimbledroid/')
        .expect(400, done);
    });

    it.skip('should return 200', (done) => {
      // XXX: If the data is now exclusively being retrieved via
      // Redis then this backend is going to return an empty structure
      // We should improve this test to actually be meaningful
      request()
        .get(`/api/android/nimbledroid/?product=${product}`)
        .expect(200, done);
    });

    beforeEach(() => {
      process.env.NIMBLEDROID_EMAIL = 'nobody@moz.com';
      process.env.NIMBLEDROID_API_KEY = 'foo_bar';
      process.env.REDIS_URL = 'redis://localhost:fooPort';
    });
  });
});
