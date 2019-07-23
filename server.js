const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const options = {
    key: fs.readFileSync('keys/SERVER_key.pem'),
    cert: fs.readFileSync('keys/SERVER.crt'),
    ca: fs.readFileSync('keys/CA.crt'),
    requestCert: true,
    rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
    enableTrace: true, // Debug errors if required
    passphrase: '1234' // Pass if SERVER_key.pem requires
};

app.use((req, res) => {
    if(!req.client.authorized){
        return res.status(401).send('ACCESS DENIED');
    }
    // Examine the cert itself, and even validate based on that if required
    const cert = req.socket.getPeerCertificate();
    if (cert.subject) {
        console.log(`${cert.subject.CN} has logged in`);
    }
    res.end('You have logged in\n');
});

const listener = https.createServer(options, app).listen(8443, () => {
    console.log(`Express HTTPS server listening on port ${listener.address().port}`);
});
