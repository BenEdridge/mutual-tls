'use strict';

const fs = require('fs');
const http2 = require('http2');
const config = require('../config');

const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

// https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler
const options = {
    host: config.env.host,
    port: config.env.port,
    allowHTTP1: false, // no downgrade to HTTP/1.x
    key: fs.readFileSync(config.env.serverKey),
    cert: fs.readFileSync(config.env.serverCert),
    ca: fs.readFileSync(config.env.caCert),
    requestCert: true,
    rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
    enableTrace: true, // Debug errors if required
    minVersion: 'TLSv1.3'
};

//https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options

const http2Server = http2.createSecureServer(options).listen(options.port, options.host, () => {
    console.log(`HTTPS/2 server listening on ${http2Server.address().address} and port ${http2Server.address().port}`);
});

// Emitted each time there is a request. There may be multiple requests per session.
http2Server.on('request',(req, res) => {
    console.log('request: ', req.method, req.headers);
    if(!req.socket.authorized){
        console.error('client auth error');

        res.stream.respond({
            [HTTP2_HEADER_STATUS]: 401,
            [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
        });

        res.write('<h1>Status:</h1>');
        res.end('<h2>ACCESS DENIED</h2>');
    }
    // Examine the cert itself, and even validate based on that if required
    const cert = req.socket.getPeerCertificate();
    console.log(`${cert.subject.CN} has logged in`);

    res.stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
    });

    res.write('<h1>Status:</h1>');
    res.end(`<h2>Welcome ${cert.subject.CN}</h2>`);
});

// The 'session' event is emitted when a new Http2Session is created by the Http2Server.
http2Server.on('session', (session) => {
    console.log('session encrypted: ', session.encrypted);
    // console.log('session cert subject CN: ', session.socket.getPeerCertificate().subject.CN);
    console.log('session socket protocol: ', session.socket.getProtocol());
});

// The 'unknownProtocol' event is emitted when a connecting client fails to negotiate an allowed protocol (i.e. HTTP/2 or HTTP/1.1).
http2Server.on('unknownProtocol', (tlsSocket) => {
    console.error('unknownProtocol', tlsSocket.getProtocol());
    tlsSocket.end();
});

// The 'sessionError' event is emitted when an 'error' event is emitted by an Http2Session object associated with the Http2Server.
http2Server.on('sessionError', (error) => console.error('sessionError:', error));

//The 'timeout' event is emitted when there is no activity on the Server for a given number of milliseconds set using http2server.setTimeout(). Default: 2 minutes.
http2Server.on('timeout', () => console.error('timeout'));

http2Server.on('error', (error) => console.error('error:', error));

process.on('unhandledRejection', (reason, p) => {
    // I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
    throw reason;
  });

process.on('uncaughtException', (error) => {
    // Not good! An uncaught exception :(
    console.error('uncaughtException', error)
    process.exit(1);
});
