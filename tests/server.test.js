const tap = require('tap');
const https = require('https');
const http2 = require('http2');
const websocket = require('ws');
const fs = require('fs');
const config = require('../src/config');

const options = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
  minVersion: config.env.minVersion,
};

const http2Options = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
  rejectUnauthorized: true,
  allowHTTP1: false,
  minVersion: config.env.minVersion
};

const badOptions = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
  cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
  ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
  minVersion: config.env.minVersion,
};

const server = require('../src/server_http');

tap.test('http/1 gets a successful response with valid certs', (t) => {

  const req = https.get(options, (res) => {
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

  const clientHttp2Session = http2.connect('https://127.0.0.1:8443', http2Options);
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

tap.test('WebSocket gets a successful response with valid certs', (t) => {

  const ws = new websocket(`wss://${options.host}:${options.port}`, options);

  ws.on('message', (data) => {
    t.equal(data.toString(), 'Welcome to Mutual-TLS Websockets!');
    ws.terminate(); // immediately close
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

tap.test('WebSocket returns an error for invalid certs', (t) => {
  const ws = new websocket(`wss://127.0.0.1:${options.port}`, badOptions);

  ws.on('message', (data) => {
    t.fail('Should not receive data!');
  });

  ws.on('error', (error) => {
    t.equal(error.toString(), 'Error: certificate signature failure');
  });

  ws.on('close', () => {
    t.end();
  });
});

tap.tearDown(() => {
  server.http2Server.close();
})