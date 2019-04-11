import debug from 'debug';
import asyncRedis from 'async-redis';
import NimbledroidClient from '../utils/NimbledroidClient';

const debugLog = debug('script:debug');
const infoLog = debug('script:info');
const errorLog = debug('script:error');

if (
  !process.env.REDIS_URL ||
  !process.env.NIMBLEDROID_API_KEY ||
  !process.env.NIMBLEDROID_EMAIL
) {
  throw Error('You need to set NIMBLEDROID_EMAIL, NIMBLEDROID_API_KEY and REDIS_URL');
}

const nimbledroidClient = new NimbledroidClient(
  process.env.NIMBLEDROID_EMAIL,
  process.env.NIMBLEDROID_API_KEY,
);
const redisClient = asyncRedis.createClient(process.env.REDIS_URL);

redisClient.on('error', (err) => {
  errorLog(err);
});

// eslint-disable-next-line consistent-return
const storeProfilingRunIfMissing = async (profilingRunData) => {
  const KNOWN_STATUS = ['Crawling', 'Failed', 'Profiling', 'Profiled'];
  const { status, url } = profilingRunData;
  if (!KNOWN_STATUS.includes(status)) {
    throw Error(`Status: ${status} is new to us; Handle it in the code.`);
  }

  // e.g. cache:https://nimbledroid.com/api/v2/users/npark@mozilla.com/apps/org.mozilla.klar/apks/103
  const key = `cache:${url}`;
  // The status 'Failed' means 'completed' in the Nimbledroid API
  if (status === 'Failed') {
    const cached = await redisClient.get(key);
    if (!cached) {
      debugLog(`Storing ${key}`);
      await redisClient.set(key, JSON.stringify(profilingRunData));
    } else {
      debugLog(`The key is already in the cache (${key})`);
    }
  }
};

const storeDataInRedis = async (data) => {
  await Promise.all(Object.keys(data).map(index =>
    storeProfilingRunIfMissing(data[index])));
};

const fetchData = async productName =>
  nimbledroidClient.getNimbledroidData(productName);

const main = async () => {
  let errorCode = -1;
  debugLog('DEBUG output will be shown.');
  infoLog('Fetching each product can take between 20-40 seconds.');
  try {
    await Promise.all([
      'org.mozilla.fenix',
      'org.mozilla.reference.browser',
      'org.mozilla.geckoview_example',
      'com.chrome.beta',
    ].map(async (productName) => {
      infoLog(`Fetching ${productName}`);
      const productData = await fetchData(productName);
      infoLog(`Storing ${productName}`);
      await storeDataInRedis(productData);
    }));
    errorCode = 0;
  } catch (e) {
    errorLog(e);
  } finally {
    process.exit(errorCode);
  }
};

main();
