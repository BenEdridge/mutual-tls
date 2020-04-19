'use strict';

const tap = require('tap');
const websocket = require('ws');
const fs = require('fs');
const config = require('../src/config').clientConfig();

const badOptions = {
  host: config.host,
  port: config.port,
  key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
  cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
  ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
};

const { http2Server, wss } = require('../src/server_wss').init();

tap.test('WebSocket gets a successful response with valid certs', (t) => {

  const ws = new websocket(`wss://${config.host}:${config.port}`, config);

  ws.on('message', (data) => {
    t.equal(data.toString(), 'Welcome to Mutual-TLS Websockets!');
    ws.terminate();
    t.end();
  });
});

tap.test('WebSocket returns an error for invalid certs', (t) => {

  const ws = new websocket(`wss://${config.host}:${config.port}`, badOptions);

  ws.on('message', (data) => {
    t.fail('Should not receive data!');
  });

  ws.on('upgrade', (message) => {
    t.fail('Should not receive data!');
  });

  ws.on('error', (error) => {
    t.equal(error.toString(), 'Error: certificate signature failure');
    ws.close();
    t.end();
  });

  ws.on('unexpected-response', (req, res) => {
    t.fail('Should not receive data!');
  });

});

tap.test('WebSocket returns an error for missing certs', (t) => {

  // omit cert
  const { cert, key, ca, ...missingClientOptions } = badOptions;

  const ws = new websocket(`wss://${config.host}:${config.port}`, missingClientOptions);

  ws.on('message', (data) => {
    t.fail('Should not receive data!');
  });

  ws.on('upgrade', (message) => {
    t.fail('Should not receive data!');
  });

  ws.on('error', (error) => {
    t.equal(error.toString(), 'Error: self signed certificate in certificate chain');
    ws.close();
    t.end();
  });

  ws.on('unexpected-response', (req, res) => {
    t.fail('Should not receive data!');
  });

});

tap.tearDown(() => {
  wss.close((err) => {
    if (err) throw Error(`Should not throw on close off wss ${err}`);
    http2Server.close((error) => {
      if (err) throw Error(`Should not throw on close of server ${error}`);
    });
  });
});