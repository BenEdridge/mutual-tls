# An example Mutual TLS client and server written in NodeJS

A better and more complete example of Mutual TLS authentication in NodeJS.
- Working for browser based authentication in OSX
- NodeJS Client coming soon

Client can be NodeJS TLS client or a browser
For a browser you will need to import the CA and private key for usage!

## Getting started

`keys/certificate_generator.sh`

Load the above client certificate and CA into your keychain/browser:

```
npm install
npm start
```

Connect your client to: `localhost` hopefully you will see a successful connection and no TLS issues if all is working well.

## Instructions for setting up a client:

## Resources used to build this
https://intown.biz/2016/11/22/node-client-auth/

https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2

https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae

