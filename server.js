const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();
const options = {
    key: fs.readFileSync('keys/server-key.pem'),
    cert: fs.readFileSync('keys/server-crt.pem'),
    ca: fs.readFileSync('keys/signed-client-crt.pem'),
    requestCert: true,
    rejectUnauthorized: false,
    enableTrace: true,
    passphrase: '123456' //only if private key requires?
};

app.use((req, res, next) => {
    if(!req.client.authorized){
        return res.status(401).send('NO ACCESS');
    }
    res.writeHead(200);
    res.end("hello world\n");
    next();
});

const listener = https.createServer(options, app).listen(4433, () => {
    console.log('Express HTTPS server listening on port ' + listener.address().port);
});

