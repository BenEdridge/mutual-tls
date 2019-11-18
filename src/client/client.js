'use strict';

const fs = require('fs');
const https = require('https');
const conf = require('../config');

const options = {
    hostname: conf.env.host,
    port: conf.env.port,
    path: '/',
    method: 'GET',
    key: fs.readFileSync(conf.env.clientKey),
    cert: fs.readFileSync(conf.env.clientCert),
    ca: fs.readFileSync(conf.env.caCert),
};

const req = https.request(options, (res) => {
    res.on('data', (data) => {
        // process.stdout.write(data);
        console.log(data.toString());
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
