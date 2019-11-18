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

const server = require('../src/server/server');

tap.test('gets a 200 response', (t) => {
  const req = https.get(options, (res) => {
    t.plan(1);
    res.on('data', (data) => {
        t.equal(data.toString(), 'Welcome to your secure mutual TLS website');
        t.end();
    }).on('error', (err) => {
      t.fail('error');
      t.end();
    });
  });
  req.end();
});

tap.test('throws an error for incorrect certs', (t) => {
  
  t.plan(1);
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
    t.equal(err.message, "certificate signature failure");
    t.end();
  });
  req.end();
});

tap.tearDown(() => {
  server.server.close();
})