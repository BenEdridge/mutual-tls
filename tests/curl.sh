#!/bin/sh
curl -i --cert keys/CLIENT.crt --key keys/CLIENT_key.pem --cacert keys/CA.crt https://localhost:8443
