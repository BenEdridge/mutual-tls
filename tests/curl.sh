#!/bin/sh
curl -i --cert ../keys/CLIENT.crt --key ../keys/CLIENT_key.pem --cacert ../keys/CA.crt https://127.0.0.1:8443
