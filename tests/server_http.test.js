'use strict';

const tap = require('tap');
const https = require('https');
const http2 = require('http2');
const fs = require('fs');
const config = require('../src/config');

const badOptions = {
  host: config.clientConfig.host,
  port: config.clientConfig.port,
  key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
  cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
  ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
};

const server = require('../src/server_http').init();

tap.test('http/1 gets a successful response with valid certs', (t) => {

  const req = https.get(config.clientConfig, (res) => {
    let data = '';

    res.on('data', (d) => {
      data += d;
    });

    res.on('close', () => {
      t.equal(data.toString(), '<h1>Status:</h1><h2>Welcome client_1</h2>');
      req.end();
      t.end();
    });

  });
});

tap.test('http/2 gets a successful response with valid certs', (t) => {

  const clientHttp2Session = http2.connect('https://127.0.0.1:8443', config.clientConfig);
  const clientHttp2Stream = clientHttp2Session.request();

  let data = '';

  clientHttp2Stream.on('data', (chunk) => {
    if (chunk) data += chunk;
  });

  clientHttp2Stream.on('end', () => {
    t.equal(data.toString(), '<h1>Status:</h1><h2>Welcome client_1</h2>');
    clientHttp2Session.close();
    t.end();
  });
});

tap.test('http/1 returns an error for invalid certs', (t) => {
  https.get(badOptions, (res) => {
    res.on('data', (d) => {
      t.fail('Connection Should Fail');
    });
  }).on('error', (e) => {
    t.equal(e.toString(), 'Error: certificate signature failure');
  }).on('close', () => {
    t.end();
  })
});

tap.test('http/2 returns an error for invalid certs', (t) => {

  const clientHttp2Session = http2.connect('https://127.0.0.1:8443', badOptions);
  const clientHttp2Stream = clientHttp2Session.request();

  t.plan(2);

  clientHttp2Stream.on('error', (error) => {
    t.equal(error.message, 'The pending stream has been canceled (caused by: certificate signature failure)');
  });

  clientHttp2Session.on('error', (error) => {
    t.equal(error.message, 'certificate signature failure');
    t.end();
  });
});

tap.tearDown(() => {
  server.close();
})