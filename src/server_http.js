'use strict';

const fs = require('fs');
const http2 = require('http2');
const websockets = require('ws');
const config = require('./config');

const {
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

// https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler
const options = {
  host: config.env.host,
  port: config.env.port,
  allowHTTP1: config.env.allowHTTP1, // downgrade to http1 
  key: fs.readFileSync(config.env.serverKey),
  cert: fs.readFileSync(config.env.serverCert),
  ca: fs.readFileSync(config.env.caCert),
  requestCert: true,
  rejectUnauthorized: config.env.rejectUnauthorized, // if enabled you cannot do authentication based on client cert
  enableTrace: true, // Debug errors if required
  minVersion: config.env.minVersion,
  // passphrase: '123456', // Pass if SERVER_key.pem requires
};

//https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
const http2Server = http2.createSecureServer(options).listen(options.port, options.host, () => {
  console.log(`HTTPS/2 and Websocket server listening on ${http2Server.address().address} and port ${http2Server.address().port}`);
});

// Websockets setup making use of the http2Server
const wss = new websockets.Server({
  server: http2Server,
});

wss.on('connection', function connection(ws) {
  console.info('### connection received', ws.authorized);

  ws.on('message', function incoming(message) {
    console.log('Server Received: %s', message);
  });

  ws.on('upgrade', (message) => {
    console.info(message);
  });

  ws.on('close', (code, reason) => {
    console.info('websocket closed', code, reason);
  });

  ws.on('error', (e) => {
    console.error('error', e);
    ws.send(e);
  });

  ws.on('unexpected-response', (req, response) => {
    console.error(req, response);
    ws.send(e);
  });

  ws.send('Welcome to Mutual-TLS Websockets!');
});

wss.on('error', (e) => {
  console.error('websocket server error', e)
});

// Emitted each time there is a request. There may be multiple requests per session.
http2Server.on('request', (req, res) => {
  console.log('Request from: ', req.connection.remoteAddress, req.method, req.headers);

  res.write('<h1>Status:</h1>');

  if (!req.socket.authorized) {

    console.error('client auth error');
    streamResponder(res.stream, 401);
    res.end('<h2>ACCESS DENIED</h2>');

  } else {

    // Examine the cert itself, and even validate based on that if required
    const cert = req.socket.getPeerCertificate();
    if (cert.subject) {
      console.log(`${cert.subject.CN} has logged in`);
    }
    streamResponder(res.stream, 200);
    res.end(`<h2>Welcome ${cert.subject.CN}</h2>`);
  }
});

const streamResponder = (stream, statusCode = 200) => {
  if (stream) {
    stream.respond({
      [HTTP2_HEADER_STATUS]: statusCode,
      [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
    });
  }
}

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

// I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
process.on('unhandledRejection', (reason, p) => { throw reason; });

// Not good! An uncaught exception!
process.on('uncaughtException', (error) => {
  console.error('uncaughtException :/', error)
  process.exit(1);
});

module.exports = {
  http2Server
}