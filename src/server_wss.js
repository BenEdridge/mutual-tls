'use strict';

const http2 = require('http2');
const websockets = require('ws');
const options = require('./config').serverConfig;

const http2secureServer = http2.createSecureServer(options);

const init = () => {
  //https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
  const http2Server = http2secureServer.listen(options.port, options.host, () => {
    console.log(`Websocket server listening on ${http2Server.address().address} and port ${http2Server.address().port}`);
  });

  const wss = new websockets.Server({
    server: http2Server,
  });

  wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
      console.log('Server Received: %s', message);
    });

    ws.on('upgrade', (message) => {
      console.info(`upgrade ${message}`);
    });

    ws.on('close', (code, reason) => {
      console.info('websocket closed', code, reason);
    });

    ws.on('error', (e) => {
      console.error('error', e);
      ws.send(e);
    });

    ws.on('unexpected-response', (req, response) => {
      console.error(req, response);
    });

    ws.send('Welcome to Mutual-TLS Websockets!');
  });

  wss.on('error', (e) => {
    console.error('websocket server error', e)
  });

  return {http2Server, wss};
};

module.exports = {
  init
}