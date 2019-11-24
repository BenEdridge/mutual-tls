const tap = require('tap');
const https = require('https');
const fs = require('fs');
const conf = require('../src/config');

const options = {
  hostname: conf.env.host,
  port: conf.env.port,
  path: '/',
  key: fs.readFileSync(conf.env.clientKey),
  cert: fs.readFileSync(conf.env.clientCert),
  ca: fs.readFileSync(conf.env.caCert),
};

const server = require('../src/server');

tap.test('gets a successful response with valid certs', (t) => {

  const req = https.get(options, (res) => {
    let data = '';

    res.on('data', (d) => {
      data+=d;
    });

    res.on('close', () => {
      t.equal(data.toString(), '<h1>Status:</h1><h2>Welcome client_1</h2>');
      t.end();
    });

  });
  req.end();
});

tap.test('throws an error for incorrect certs', (t) => {
  
  const badOptions = {
    hostname: conf.env.host,
    port: conf.env.port,
    path: '/',
    key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
    cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
    ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
  };

  const req = https.get(badOptions);

  req.on('error', (err) => {
    t.pass(err.message);
    t.end();
  });
  req.end();
});

tap.tearDown(() => {
  server.http2Server.close();
})