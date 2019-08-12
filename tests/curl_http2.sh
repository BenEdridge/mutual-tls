#!/bin/sh
curl -i --http2 --cert keys/CLIENT.crt --key keys/CLIENT_key.pem --cacert keys/CA.crt https://localhost:8443
