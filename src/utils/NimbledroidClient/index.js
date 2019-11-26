import debug from 'debug';
import fetchJson from '../../fetch/json';
import config from '../../configuration';

const errorLog = debug('script:error');

const apiUrl = product => `${config.nimbledroidApiUrl}/${product}/apks`;

const generateAuthKey = (email, apiKey) => (
  Buffer.from(`${email}:${apiKey}`).toString('base64')
);

// It makes the data smaller (from 1.66mb to 1.23mb)
const removeConsoleMessage = nimbledroidData => (
  nimbledroidData.map((run) => {
    delete run.console_message;
    return run;
  })
);

class NimbledroidHandler {
  constructor(apiKey, email) {
    if (!apiKey || !email) {
      throw Error('You need to instantiate with an apiKey and email address.');
    }
    this.apiKey = apiKey;
    this.email = email;
  }

  async getNimbledroidData(product) {
    return removeConsoleMessage(await this.fetchData(product));
  }

  async fetchData(product) {
    const url = apiUrl(product);
    const data = await fetchJson(
      apiUrl(product),
      {
        method: 'GET',
        headers: this.generateAuthHeaders(),
        ttl: 30 * 60, // 30 minutes
      },
    );
    if (data.length === 0) {
      errorLog(`There was nothing to be stored from ${url}`);
    }
    return data;
  }

  generateAuthHeaders() {
    return ({
      Authorization: `Basic ${generateAuthKey(this.email, this.apiKey)}`,
    });
  }
}

export default NimbledroidHandler;
