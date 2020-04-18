'use strict';

const http2 = require('http2');
const https = require('https');
const options = require('./config').clientConfig;

const init = () => {
  if (process.env.HTTP_VER === "1") {

    const req = https.request(options, (res) => {
      res.on('data', (data) => console.log(data.toString()));
      res.on('error', (error) => console.error(error));
    });

    req.on('error', (e) => console.error(e));
    req.end();

  } else if (process.env.HTTP_VER === "2") {

    let data = '';
    const clientHttp2Session = http2.connect('https://localhost:8443', options);
    const clientHttp2Stream = clientHttp2Session.request();

    // clientHttp2Stream.setEncoding('utf8');

    clientHttp2Stream.on('response', (responseHeaders) => console.log('Response headers:', JSON.stringify(responseHeaders)));

    clientHttp2Stream.on('data', (chunk) => {
      if (chunk) {
        console.log('Chunk received:', chunk.toString());
        data += chunk;
      }
    });

    clientHttp2Stream.on('end', () => {
      console.log('Stream End:', data);
      clientHttp2Session.close();
    });

    clientHttp2Stream.on('error', (e) => console.error('Stream Error', e));

    clientHttp2Session.on('close', () => console.log('Session closed'));
    clientHttp2Session.on('error', (error) => console.error('Session Error', error));
    clientHttp2Session.on('frameError', (type, code, id) => console.error('Session frameError', type, code, id));
  };
};

module.exports = {
  init
};