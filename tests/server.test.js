const tap = require('tap');
const https = require('https');
const http2 = require('http2');
const websocket = require('ws');
const fs = require('fs');
const config = require('../src/config');

const options = {
  host: config.env.host,
  port: config.env.port,
  path: '/',
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
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

const server = require('../src/server_http');

tap.test('http gets a successful response with valid certs', (t) => {

  const req = https.get(options, (res) => {
    let data = '';

    res.on('data', (d) => {
      data += d;
    });

    res.on('close', () => {
      t.equal(data.toString(), '<h1>Status:</h1><h2>Welcome client_1</h2>');
      t.end();
    });

  });
  req.end();
});

tap.test('http/2 gets a successful response with valid certs', (t) => {

  let data = '';
  const clientHttp2Session = http2.connect('https://localhost:8443', http2Options);
  const clientHttp2Stream = clientHttp2Session.request();

  clientHttp2Stream.on('data', (chunk) => {
    if (chunk) {
      data += chunk;
    } else {
      throw Error('No chunk found'); // Shouldn't fail here...
    }
  });

  clientHttp2Stream.on('end', () => {
    t.equal(data.toString(), '<h1>Status:</h1><h2>Welcome client_1</h2>');
    clientHttp2Session.close();
    t.end();
  });
});

tap.test('wss gets a successful response with valid certs', (t) => {

  const ws = new websocket(`wss://${options.host}:${options.port}`, options);

  ws.on('message', (data) => {
    t.equal(data.toString(), 'Welcome to Mutual-TLS Websockets!');
    ws.close();
    t.end();
  });
});

tap.test('http1 throws an error for incorrect certs', (t) => {

  const badOptions = {
    hostname: config.env.host,
    port: config.env.port,
    path: '/',
    key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
    cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
    ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
  };

  const req = https.get(badOptions);

  req.on('error', (error) => {
    t.equal(error.toString(), 'Error: certificate signature failure');
    t.end();
  });
  req.end();
});

tap.test('wss throws an error for incorrect certs', (t) => {

  const badOptions = {
    hostname: config.env.host,
    port: config.env.port,
    path: '/',
    key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
    cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
    ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
  };

  const ws = new websocket(`wss://$localhost:${options.port}`, badOptions);

  ws.on('error', (error) => {
    t.equal(error.toString(), 'Error: WebSocket was closed before the connection was established');
    t.end();
  })
  ws.close();
});

tap.tearDown(() => {
  server.http2Server.close();
})