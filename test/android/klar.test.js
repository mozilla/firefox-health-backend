/* global describe, it */
import superagent from 'supertest';
import app from '../../src/app';

const request = () => superagent(app.listen());

describe('/android', () => {
  describe('GET /android/klar/', () => {
    it('should return 500', (done) => {
      request()
        .get('/api/android/klar')
        .expect(500, done);
    });
  });
});
