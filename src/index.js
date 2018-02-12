import http from 'http';
import app from './app';

if (module.hot) {
  module.hot.accept(['./app']);
}

/* istanbul ignore if */
if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app.callback());
  server.on('listening', () => {
    const { address, port } = server.address();
    // eslint-disable-next-line
    console.log('http://%s:%d/ in %s', address, port, process.env.NODE_ENV || 'dev');
  });
  server.listen(process.env.PORT || 3000);
}
