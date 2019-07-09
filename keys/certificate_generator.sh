#!/bin/sh

#########################
# Certificate Authority #
#########################

echo "Creating Certificate Authority Certificate";
# Must be a v3_ca certificate to prevent issues with Client usage in some browsers or OSes
openssl req -new -x509 -days 365 -keyout ca-key.pem -out ca-crt.pem -extensions v3_ca

#########################
# Server                #
#########################

echo "Generating Server Private Key";
openssl genrsa -out server-key.pem 4096

echo "Generating Server Certificate Signing Request";
openssl req -new -sha256 -key server-key.pem -out server-csr.pem

echo "Signing Server Key with CA";
openssl x509 -req -days 365 -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem

#########################
# Client                #
#########################

# Create as many clients as you need, all clients must be signed by the CA.
echo "Creating Client Private Key";
openssl genrsa -out client.pem 2048

echo "Creating Client Certificate Signing Request";
openssl req -new -sha256 -key client.pem -out client-csr.pem

echo "Signing Client Key with CA";
openssl x509 -req -days 200 -in client-csr.pem -CA ca-crt.pem -CAkey ca-key.pem  -out signed-client-crt.pem 

#########################
# Checking              #
#########################

openssl verify -CAfile ca-crt.pem signed-client-crt.pem
openssl verify -CAfile ca-crt.pem server-crt.pem

# Import for OSX keychain
# security import client.pem -k ~/Library/Keychains/login.keychain
