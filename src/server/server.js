'use strict';

const fs = require('fs');
const https = require('https');
const conf = require('../config');

const options = {
    key: fs.readFileSync(conf.env.serverKey),
    cert: fs.readFileSync(conf.env.serverCert),
    ca: fs.readFileSync(conf.env.caCert),
    requestCert: true,
    rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
    enableTrace: true, // Debug errors if required
    passphrase: '123456', // Pass if SERVER_key.pem requires
};

const requestHandler = (req, res) => {

    const tlsSocket = req.socket;

    console.log('Request from: ', req.connection.remoteAddress);
    console.log('Authorized: ', tlsSocket.authorized);

    if(!tlsSocket.authorized){
        res.writeHead(401, 'ACCESS DENIED', { 'Content-Type': 'text/html' });
        res.end();
    }
    // Examine the cert itself, and even validate based on that if required
    const cert = tlsSocket.getPeerCertificate();
    if (cert.subject) {
        console.log(`${cert.subject.CN} has logged in`);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Welcome to your secure mutual TLS website');
};

const server = https.createServer(options, requestHandler).listen(conf.env.port, conf.env.host, () => {
    console.log(`HTTPS server listening on ${server.address().address} and port: ${server.address().port}`);
});

server.on('tlsClientError', (err) => {
    console.error('tlsClientError', err);
});

module.exports = {
    server,
}