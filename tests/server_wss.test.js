'use strict';

const tap = require('tap');
const websocket = require('ws');
const fs = require('fs');
const config = require('../src/config');

const badOptions = {
  host: config.clientConfig.host,
  port: config.clientConfig.port,
  key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
  cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
  ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
};

const wss = require('../src/server_wss').init();

// tap.test('WebSocket gets a successful response with valid certs', (t) => {

//   const ws = new websocket(`wss://${config.clientConfig.host}:${config.clientConfig.port}`, config.clientConfig);

//   ws.on('message', (data) => {
//     t.equal(data.toString(), 'Welcome to Mutual-TLS Websockets!');
//     ws.terminate(); // immediately close
//     t.end();
//   });
// });

tap.test('WebSocket returns an error for invalid certs', (t) => {
  const ws = new websocket(`wss://127.0.0.1:8443`, badOptions);

  ws.on('message', (data) => {
    t.fail('Should not receive data!');
  });

  ws.on('upgrade', (message) => {
    t.fail('Should not receive data!');
  });

  ws.on('error', (error) => {
    t.equal(error.toString(), 'Error: certificate signature failure');
    ws.terminate();
    wss.close();
    t.end();
  });

  ws.on('unexpected-response', (req, res) => {
    t.fail('Should not receive data!');
  });

});

tap.tearDown(() => {
  wss.removeAllListeners();
  wss.close();
});