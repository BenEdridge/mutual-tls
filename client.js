const fs = require('fs');
const https = require('https');

const options = {
    hostname: 'localhost',
    port: 8443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync('keys/CLIENT_key.pem'),
    cert: fs.readFileSync('keys/CLIENT.crt'),
    ca: fs.readFileSync('keys/CA.crt')
};

const req = https.request(options, (res) => {
    res.on('data', (data) => {
        process.stdout.write(data);
    });
});

req.end();

req.on('error', (e) => {
    console.error(e);
});