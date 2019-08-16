'use strict';

const fs = require('fs');
const https = require('https');
const conf = require('./config');

const options = {
    key: fs.readFileSync(conf.env.serverKey),
    cert: fs.readFileSync(conf.env.serverCert),
    ca: fs.readFileSync(conf.env.caCert),
    requestCert: true,
    rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
    enableTrace: true, // Debug errors if required
    passphrase: '123456', // Pass if SERVER_key.pem requires
};

const server = https.createServer(options).listen(conf.env.port, conf.env.host, () => {
    console.log(`HTTPS server listening on ${server.address().address} and port: ${server.address().port}`);
});

server.on('secureConnection', (tlsSocket) => {
    console.log('secureConnection');

    if(!tlsSocket.authorized){
        // return res.status(401).send('ACCESS DENIED');
        return tlsSocket.write('DENIED');
    }
    // Examine the cert itself, and even validate based on that if required
    const cert = tlsSocket.getPeerCertificate();
    if (cert.subject) {
        console.log(`${cert.subject.CN} has logged in`);
    }
    tlsSocket.end('You have logged in');
});

server.on('tlsClientError', (err) => {
    console.error('tlsClientError', err);
});
