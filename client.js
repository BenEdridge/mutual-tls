const fs = require('fs');
const https = require('https');

const options = {
    hostname: 'localhost',
    port: 8443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync('keys/client.pem'),
    cert: fs.readFileSync('keys/signed-client-crt.pem'),
    ca: fs.readFileSync('keys/ca-crt.pem'),
    //rejectUnauthorized: false,
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
