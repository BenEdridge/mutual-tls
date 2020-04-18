'use strict';

const http2 = require('http2');
const options = require('./config').serverConfig;

const {
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

const http2secureServer = http2.createSecureServer(options);

const init = () => {

  //https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
  const http2Server = http2secureServer.listen(options.port, options.host, () => {
    console.log(`HTTPS/2 and Websocket server listening on ${http2Server.address().address} and port ${http2Server.address().port}`);
  });

  // Emitted each time there is a request. There may be multiple requests per session.
  http2Server.on('request', (req, res) => {

    console.log(`${req.socket.getProtocol()} ${req.method} request from: ${req.connection.remoteAddress}`);
    res.setHeader('Content-Type', 'text/html');

    if (!req.socket.authorized) {
      console.error('client auth error');
      // res.writeHead(401);
      streamResponder(res.stream, 401);
      res.end('<h1>Status:</h1><h2>ACCESS DENIED</h2>');
    } else {
      // Examine the cert itself, and even validate based on that if required
      const cert = req.socket.getPeerCertificate();

      if (cert.subject) {
        console.log(`${cert.subject.CN} issued by: ${cert.issuer.CN} has logged in!`);
      } else {
        console.log('Cert has no subject?');
      }
      // res.writeHead(200);
      streamResponder(res.stream, 200);
      res.end(`<h1>Status:</h1><h2>Welcome ${cert.subject.CN}</h2>`);
    }
  });

  // The 'session' event is emitted when a new Http2Session is created by the Http2Server.
  http2Server.on('session', (session) => {
    const clientCN = session.socket.getPeerCertificate().subject.CN;
    const issuerCN = session.socket.getPeerCertificate().issuer.CN;
    console.log(`${session.socket.getProtocol()} session started with client CN: ${clientCN} issued by: ${issuerCN}`);
  });

  http2Server.on('stream', (stream, statusCode = 200) => {
    if (!stream.headersSent) {
      console.log('Sending headers')
      stream.respond({
        [HTTP2_HEADER_STATUS]: statusCode,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
      });
    }
  })

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

  return http2Server;
};

const streamResponder = (stream, statusCode = 200) => {
  if (stream) {
    stream.respond({
      [HTTP2_HEADER_STATUS]: statusCode,
      [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
    });
  }
};

module.exports = {
  init
};