'use strict';

const fs = require('fs');
const http2 = require('http2');
const https = require('https');

const config = require('./config');

const options = {
  hostname: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
  rejectUnauthorized: config.env.rejectUnauthorized,
  allowHTTP1: config.env.allowHTTP1,
  minVersion: config.env.minVersion
};

if (process.env.HTTP_VER === "1") {

  const req = https.request(options, (res) => {
    res.on('data', (data) => console.log(data.toString()));
    res.on('error', (error) => console.error(error));
  });

  req.on('error', (e) => console.error(e));
  req.end();

} else if (process.env.HTTP_VER === "2") {

  let data = '';
  const clientHttp2Session = http2.connect('https://localhost:8443', options);
  const clientHttp2Stream = clientHttp2Session.request();

  // clientHttp2Stream.setEncoding('utf8');

  clientHttp2Stream.on('response', (responseHeaders) => console.log('Response headers:', JSON.stringify(responseHeaders)));

  clientHttp2Stream.on('data', (chunk) => {
    if (chunk) {
      console.log('Chunk received:', chunk.toString());
      data += chunk;
    }
  });

  clientHttp2Stream.on('end', () => {
    console.log('Stream End:', data);
    clientHttp2Session.close();
  });

  clientHttp2Stream.on('error', (e) => console.error('Stream Error', e));

  clientHttp2Session.on('close', () => console.log('Session closed'));
  clientHttp2Session.on('error', (error) => console.error('Session Error', error));
  clientHttp2Session.on('frameError', (type, code, id) => console.error('Session frameError', type, code, id));

} else {
  console.error('Failed to start, set HTTP_VER=1 or HTTP_VER=2');
}

// I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
process.on('unhandledRejection', (reason, p) => { throw reason });

// Not good! An uncaught exception!
process.on('uncaughtException', (error) => {
  console.error('uncaughtException :/', error)
  process.exit(1);
});