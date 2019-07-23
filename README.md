# Mutual TLS server and client in NodeJS

A better and more complete example of Mutual TLS authentication in NodeJS.
- Working for browser based authentication (Requires setup)
- NodeJS Client connects to TLS server using supplied certificates
- Keys and Certs in `keys` can be used with other clients

## Getting started

```
npm install
npm run generate:keys // Load these client keys into your browser/OS if required
npm run start:server   // Starts the server
npm run start:client   // Starts the client
```

Connect your browser to: `localhost` hopefully you will see a successful connection and no TLS issues if all is working well.

## Instructions for clients and certificate imports:

### Linux

### Android

### OSX

### Windows

## Resources used to build this
https://intown.biz/2016/11/22/node-client-auth/

https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2

https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae

