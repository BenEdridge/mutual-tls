const fs = require('fs');
const http2 = require('http2');

const http2Settings = {
  // enablePush: true,
};

const options = {
    key: fs.readFileSync('keys/CLIENT_key.pem'),
    cert: fs.readFileSync('keys/CLIENT.crt'),
    ca: fs.readFileSync('keys/CA.crt'),
    rejectUnauthorized: true,
    serverName: 'localhost',
    allowHTTP1: false,
    settings: {
      ...http2Settings
    },
};

let data = '';

const clientHttp2Session = http2.connect('https://localhost:8443', options);

const clientHttp2Stream = clientHttp2Session.request({ 
  ':method': 'GET', 
  ':path': '/' 
});

clientHttp2Stream.setEncoding('utf8');

clientHttp2Stream.on('response', (responseHeaders) => {
  console.log('Response headers:', JSON.stringify(responseHeaders));
});

// Receving pushed streams
clientHttp2Session.on('stream',(pushedStream, incomingHeaders, flags) =>{
  console.log('Pushed stream:');

  pushedStream.on('push', (responseHeaders) => {
    // handle response headers
    console.log('Push headers received: ', responseHeaders);
  });

  pushedStream.on('data', (chunk) => {
    console.log('Pushed Chunk: ', chunk.toString());
  });
});

clientHttp2Stream.on('data', (chunk) => {
  if(chunk){
    console.log('Chunk received:', JSON.stringify(chunk.toString()));
    data += chunk;
  }
});

clientHttp2Stream.on('error', (e) => console.error(e));

clientHttp2Stream.on('end', () => {
  console.log('end (Client destroyed)');
  console.log('Final Data:', data);
  clientHttp2Session.close();
});

clientHttp2Session.on('close', () => {
  console.log('closed');
});

clientHttp2Session.on('frameError', (type, code, id) => {
  console.log('frameError', type, code, id);
});

clientHttp2Session.on('goaway', (errorCode, lastStreamId, opaqueData) => {
  console.log('goaway', errorCode);
});

clientHttp2Session.on('localSettings',(settings) => {
  console.log(settings);
});

clientHttp2Session.on('ping',() => {
  console.log('ping!');
});

clientHttp2Session.on('remoteSettings',() => {
  console.log('remoteSettings');
});