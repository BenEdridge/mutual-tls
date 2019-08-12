// No support for express yet see: https://github.com/expressjs/express/pull/2237

const fs = require('fs');
const http2 = require('http2');

const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP2_HEADER_CONTENT_TYPE
} = http2.constants;

// https://nodejs.org/api/http2.html#http2_settings_object
const http2Settings = {
    // enablePush: true,
};

// https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler
const options = {
    host: 'localhost',
    allowHTTP1: false, // no downgrade to HTTP/1.x
    key: fs.readFileSync('keys/SERVER_key.pem'),
    cert: fs.readFileSync('keys/SERVER.crt'),
    ca: fs.readFileSync('keys/CA.crt'),
    requestCert: true,
    rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
    enableTrace: true, // Debug errors if required
    settings: { ...http2Settings },
};

const http2Server = http2.createSecureServer(options).listen(8443, () => {
    console.log(`HTTP2 server listening on port ${http2Server.address().port}`);
});

// Emitted each time there is a request. There may be multiple requests per session.
http2Server.on('request',(req, res) => {
    console.log('request');
    if(!req.socket.authorized){
        console.log('client auth error');
        res.stream.respond({
            HTTP2_HEADER_STATUS: 401,
            HTTP2_HEADER_CONTENT_TYPE: 'text/html',
        });
        res.write('<h1>Status:</h1>')
        res.end('<h2>ACCESS DENIED</h2>');
    }
    // Examine the cert itself, and even validate based on that if required
    const cert = req.socket.getPeerCertificate();
    console.log(`${cert.subject.CN} has logged in`);

    res.write('<h1>Status:</h1>')
    res.end(`<h2>Welcome ${cert.subject.CN}</h2>`);
});

// The 'stream' event is emitted when a 'stream' event has been emitted by an Http2Session associated with the server.
http2Server.on('stream', (stream, incomingHttpHeaders, flags) => {
    console.log('stream:', incomingHttpHeaders, flags);

    const method = incomingHttpHeaders[HTTP2_HEADER_METHOD];
    const path = incomingHttpHeaders[HTTP2_HEADER_PATH];

    console.log('stream method/path: ', method, path);

    if(stream.pushAllowed){

        stream.pushStream({ ':path': '/' }, (err, pushStream, headers) => {
            if (err) throw err;
            pushStream.respond({ ':status': 200 });
            pushStream.end('Welcome!');
        });
    }
    stream.end('some data');

    // stream.respond({
    //     [HTTP2_HEADER_STATUS]: 200,
    //     [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
    // });

    // stream.write('<h1>Status:</h1>')
    // stream.end('<h2>You have logged in!</h2>');
});

// The 'session' event is emitted when a new Http2Session is created by the Http2Server.
http2Server.on('session', (session) => {
    console.log('session encrypted: ', session.encrypted);
    console.log('session cert subject CN: ', session.socket.getPeerCertificate().subject.CN);
});

// The 'unknownProtocol' event is emitted when a connecting client fails to negotiate an allowed protocol (i.e. HTTP/2 or HTTP/1.1). 
http2Server.on('unknownProtocol', (tlsSocket) => {
    console.log('unknown prot!', tlsSocket);
});

// The 'sessionError' event is emitted when an 'error' event is emitted by an Http2Session object associated with the Http2Server.
http2Server.on('sessionError', (error) => console.log('sessionError:', error));

//The 'timeout' event is emitted when there is no activity on the Server for a given number of milliseconds set using http2server.setTimeout(). Default: 2 minutes.
http2Server.on('timeout', () => console.error('2 min timeout!'));

http2Server.on('error', (error) => console.log('error:', error));