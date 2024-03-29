#!/usr/bin/env bash

cat << EOF

#########################
# Certificate Authority #
#########################

EOF

# Must be a v3_ca certificate to prevent issues with Client usage in some browsers or OSes
openssl req -newkey rsa:4096 -x509 -days 365 -subj '/CN=LOCAL-CA/O=My Company Name LTD./C=US' -keyout ../keys/CA_key.pem -out ../keys/CA.crt -extensions v3_ca

cat << EOF

#################################
# Generating Server Private Key #
#################################

EOF

openssl genrsa -out ../keys/SERVER_key.pem 4096

# Generating Server Certificate Signing Request
openssl req -newkey rsa:4096 -sha256 -key ../keys/SERVER_key.pem -out ../keys/SERVER_CSR.pem

# Signing Server Key with CA
openssl x509 -req -days 365 -in ../keys/SERVER_CSR.pem -CA ../keys/CA.crt -CAkey ../keys/CA_key.pem -CAcreateserial -out ../keys/SERVER.crt

cat << EOF

#########################
# Client                #
#########################

EOF

# Create as many clients as you need, all clients must be signed by the CA.
openssl genrsa -out ../keys/CLIENT_key.pem 2048

# Creating Client Certificate Signing Request
openssl req -newkey rsa:4096 -sha256 -key ../keys/CLIENT_key.pem -out ../keys/CLIENT_CSR.pem

# Signing Client Key with CA
openssl x509 -newkey rsa:4096 -days 200 -in ../keys/CLIENT_CSR.pem -CA ../keys/CA.crt -CAkey ../keys/CA_key.pem  -out ../keys/CLIENT.crt

# Generating P12 for other clients
openssl pkcs12 -export -in ../keys/CLIENT.crt -inkey ../keys/CLIENT_KEY.pem -out ../keys/CLIENT.p12

cat << EOF

#########################
# Verifying             #
#########################

EOF

openssl verify -CAfile ../keys/CA.crt ../keys/CLIENT.crt
openssl verify -CAfile ../keys/CA.crt ../keys/SERVER.crt

echo -n "Import into keychain?"
read answer

if [ "$answer" != "${answer#[Yy]}" ] ;then
    echo Trying to import keys into keychain
    security import ../keys/CLIENT.p12
    security add-trusted-cert ../keys/SERVER.crt
    security add-trusted-cert ../keys/CA.crt
else
    echo Finished!
fi
