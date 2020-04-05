'use strict';

const fs = require('fs');
const websocket = require('ws');
const config = require('./config');

const options = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
  rejectUnauthorized: config.env.rejectUnauthorized,
  allowHTTP1: config.env.allowHTTP1,
  minVersion: config.env.minVersion
};

const ws = new websocket(`wss://localhost:${options.port}`, options);

ws.on('open', () => {
  ws.send('hello');
});

ws.on('message', (data) => {
  console.info(data);
});