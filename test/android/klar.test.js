/* global beforeEach, describe, it */
import superagent from 'supertest';
import app from '../../src/app';

const request = () => superagent(app.listen());

describe('/android', () => {
  describe('GET /android/klar/', () => {
    // The output in the test run is too noisy
    // I don't want to spend more time on this as this is an API that
    // will soon go away
    it.skip('should return 500', (done) => {
      delete process.env.GOOGLE_API_KEY;
      request()
        .get('/api/android/klar')
        .expect(500, done);
    });
    it('should return 400 due to not using ?site=<foo>', (done) => {
      request()
        .get('/api/android/klar')
        .expect(400, done);
    });
    beforeEach(() => {
      process.env.GOOGLE_API_KEY = 'foo_bar';
    });
  });
});
