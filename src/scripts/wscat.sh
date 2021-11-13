#!/bin/sh

# See: https://github.com/websockets/wscat
npx wscat -c wss://localhost:8443 --ca keys/CA.crt  --cert keys/CLIENT.crt --key keys/CLIENT_key.pem