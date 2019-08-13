const fs = require('fs');
const http2 = require('http2');

const options = {
    key: fs.readFileSync('keys/CLIENT_key.pem'),
    cert: fs.readFileSync('keys/CLIENT.crt'),
    ca: fs.readFileSync('keys/CA.crt'),
    rejectUnauthorized: true,
    serverName: 'localhost',
    allowHTTP1: false,
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

clientHttp2Stream.on('data', (chunk) => {
  if(chunk){
    console.log('Chunk received:', chunk.toString());
    data += chunk;
  }
});

clientHttp2Stream.on('end', () => {
  console.log('end:');
  console.log('Final data:', data);
  clientHttp2Session.close();
});

clientHttp2Session.on('close', () => {
  console.log('Session closed');
});

clientHttp2Session.on('frameError', (type, code, id) => {
  console.error('frameError', type, code, id);
});

clientHttp2Stream.on('error', (e) => console.error('error', e));