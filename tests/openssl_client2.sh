#!/bin/sh
openssl s_client -CAfile keys/CA.crt -cert keys/CLIENT.crt -key keys/CLIENT_key.pem -host 'localhost' -port 8443 -alpn h2 -servername localhost 
