#!/bin/sh

cat << EOF

#########################
# Certificate Authority #
#########################

EOF

# Must be a v3_ca certificate to prevent issues with Client usage in some browsers or OSes
openssl req -new -x509 -days 365 -subj '/CN=LOCAL-CA/O=My Company Name LTD./C=US' -keyout CA_key.pem -out CA.crt -extensions v3_ca

cat << EOF

#################################
# Generating Server Private Key #
#################################

EOF

openssl genrsa -out SERVER_key.pem 4096

# Generating Server Certificate Signing Request
openssl req -new -sha256 -key SERVER_key.pem -out SERVER_CSR.pem

# Signing Server Key with CA
openssl x509 -req -days 365 -in SERVER_CSR.pem -CA CA.crt -CAkey CA_key.pem -CAcreateserial -out SERVER.crt

cat << EOF

#########################
# Client                #
#########################

EOF

# Create as many clients as you need, all clients must be signed by the CA.
openssl genrsa -out CLIENT_1.pem 2048

# Creating Client Certificate Signing Request
openssl req -new -sha256 -key CLIENT_1.pem -out CLIENT_CSR.pem

# Signing Client Key with CA
openssl x509 -req -days 200 -in CLIENT_CSR.pem -CA CA.crt -CAkey CA_key.pem  -out CLIENT_1.crt

cat << EOF

#########################
# Verifying             #
#########################

EOF

openssl verify -CAfile CA.crt CLIENT_1.crt
openssl verify -CAfile CA.crt SERVER.crt 

# Import for OSX keychain
# security import client.pem -k ~/Library/Keychains/login.keychain
