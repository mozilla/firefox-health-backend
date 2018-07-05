/* global describe, it */
import fetchMock from 'fetch-mock';
import superagent from 'supertest';
import app from '../src/app';

const bugzilla = require('./mocks/bugzilla');
const calendarIcs = require('./mocks/calendarIcs');
const chromeHistory = require('./mocks/chromeHistory.js');
const chromeStatus = require('./mocks/chromeStatus.json');
const firefoxVersions = require('./mocks/firefoxVersions');
const firefoxMajorReleases = require('./mocks/firefoxMajorReleases');
const firefoxStabilityReleases = require('./mocks/firefoxStabilityReleases');
const firefoxDevelopmentReleases = require('./mocks/firefoxDevelopmentReleases');
const updateXML = require('./mocks/updateXml');
const platformStatus = require('./mocks/platformStatus');

const request = () => superagent(app.listen());

describe('/release', () => {
  [...Array(10).keys()].forEach(index => (
    fetchMock.get(`http://filehippo.com/download_google_chrome/history/${index + 1}/`, chromeHistory)
  ));
  fetchMock.get('https://calendar.google.com/calendar/ical/mozilla.com_2d37383433353432352d3939%40resource.calendar.google.com/public/basic.ics', calendarIcs);
  fetchMock.get('https://product-details.mozilla.org/1.0/firefox_versions.json', firefoxVersions);
  fetchMock.get('https://product-details.mozilla.org/1.0/firefox_history_major_releases.json', firefoxMajorReleases);
  fetchMock.get('https://product-details.mozilla.org/1.0/firefox_history_stability_releases.json', firefoxStabilityReleases);
  fetchMock.get('https://product-details.mozilla.org/1.0/firefox_history_development_releases.json', firefoxDevelopmentReleases);
  fetchMock.get('begin:https://aus5.mozilla.org/', updateXML);
  fetchMock.get('https://platform-status.mozilla.org/api/status', platformStatus);
  fetchMock.get('https://www.chromestatus.com/features.json', chromeStatus);
  fetchMock.get('begin:https://bugzilla.mozilla.org/rest/bug', bugzilla);

  describe('GET /release/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/')
        .expect(200, done);
    });
  });

  describe('GET /release/chrome/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/chrome')
        .expect(200, done);
    });
  });

  describe('GET /release/latest/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/latest')
        .expect(200, done);
    });
  });

  describe('GET /release/history/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/history')
        .expect(200, done);
    });
    it('should return 200 for beta', (done) => {
      request()
        .get('/api/release/history?channel=beta')
        .expect(200, done);
    });
  });

  describe('GET /release/calendar/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/calendar')
        .expect(200, done);
    });
  });

  describe('GET /release/updates/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/release/updates')
        .expect(200, done);
    });
  });
});

describe('/crashes', () => {
  if (process.env.REDASH_API_KEY) {
    describe('GET /crashes/', () => {
      it('should return 200', (done) => {
        request()
          .get('/api/crashes/')
          .expect(200, done);
      });
    });
    describe('GET /crashes/beta/builds', () => {
      it('should return 200', (done) => {
        request()
          .get('/api/crashes/beta/builds')
          .expect(200, done);
      });
    });
  }
});

describe('/bz', () => {
  describe('GET /regressions/missed/', () => {
    it('should return 200', (done) => {
      request()
        .get('/api/bz/regressions/missed/')
        .expect(200, done);
    });
  });
});
