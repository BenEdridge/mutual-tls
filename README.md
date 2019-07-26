# Mutual TLS server and client in NodeJS

A better and more complete example of Mutual TLS authentication in NodeJS

- Use Firefox, Safari or Chrome to connect using a Client Certificate (See setup below)
- NodeJS `client.js` connects to TLS server using supplied certificates
- Generated certificates and keys in `keys` can be used with other clients and servers if required

## Getting Started

```
npm install
npm run generate:keys-openssl
npm run start:server
```

```
// Starts a client to connect to the server
npm run start:client

// Remove keys
npm run generate:clean
```

```
// Quick tests using curl and openssl

tests/curl.sh
tests/openssl_client.sh
```

Connect your browser to: `localhost:8443` and you should be requested to supply a certificate or should connect automatically if the `CA` and `Client`
certificates have been imported to your browser/OS.

## Importing and using Certificates

The generator script will create certificates and private keys in the `keys` directory.

- Certificates:
  - CA.crt
  - CLIENT.crt
  - SERVER.crt

- Private Keys:
  - CA_key.pem
  - CLIENT_key.pem
  - SERVER_key.pem

These certificates and keys need to be imported and loaded into the browser or operating system connecting your the server as below.

### OSX

### Linux

### Android

- Transfer the CA and Client certificate to your device
- Settings -> Security -> Device Administrator and Credentials -> Install from SD card etc.

### Windows

## Resources
- https://intown.biz/2016/11/22/node-client-auth/
- https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2
- https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae

