#!/usr/bin/env bash

# Generate pkcs12 file for IOS, Firefox, Android imports
openssl pkcs12 -export -in ../keys/CLIENT.crt -inkey ../keys/CLIENT_key.pem -out ../keys/CLIENT.p12
openssl pkcs12 -export -in ../keys/SERVER.crt -inkey ../keys/SERVER_key.pem -out ../keys/SERVER.p12


