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

ws.on('unexpected-response', (req, res) => {
  console.info('unexpected-response', req, res);
});

ws.on('close', (code, reason) => {
  console.info('WebSocket closed', code, reason);
});

ws.on('error', (error) => {
  console.error(error);
});

// I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
process.on('unhandledRejection', (reason, p) => { throw reason });

// Not good! An uncaught exception!
process.on('uncaughtException', (error) => {
  console.error('uncaughtException :/', error)
  process.exit(1);
});