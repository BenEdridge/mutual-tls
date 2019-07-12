const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const options = {
    key: fs.readFileSync('keys/SERVER_key.pem'),
    cert: fs.readFileSync('keys/SERVER.crt'),
    ca: fs.readFileSync('keys/CA.crt'),
    requestCert: true,
    rejectUnauthorized: false, //if enabled you cannot do authentication based on client cert
    enableTrace: true,
    passphrase: '1234' //only if private key requires?
};

app.use((req, res) => {
    if(!req.client.authorized){
        return res.status(401).send('ACCESS DENIED');
    }
    //examine the cert itself, and even validate based on that!
    const cert = req.socket.getPeerCertificate();
    if (cert.subject) {
       console.log(cert.subject.CN);
    }
    res.send('You have logged in');
    //res.writeHead(200);
    //res.end("hello world\n");
    //next();
});

const listener = https.createServer(options, app).listen(8443, () => {
    console.log('Express HTTPS server listening on port ' + listener.address().port);
});
