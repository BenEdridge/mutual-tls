'use strict';
const fs = require('fs');

const keyPathENV = process.env.KEY_PATH || './keys';

const listenerConfig = Object.freeze({
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 8443,
});

const certConfig = Object.freeze({
  keyPath: keyPathENV,
  keySize: 2048,
  caCert: `${keyPathENV}/CA.crt`,
  serverKey: `${keyPathENV}/SERVER_key.pem`,
  serverCert: `${keyPathENV}/SERVER.crt`,
  clientKey: `${keyPathENV}/CLIENT_key.pem`,
  clientCert: `${keyPathENV}/CLIENT.crt`,
  clientCN: 'client_1',
  clientCN2: 'client_2',
});

const clientConfig = Object.freeze({
  ...listenerConfig,
  key: fs.readFileSync(certConfig.clientKey),
  cert: fs.readFileSync(certConfig.clientCert),
  ca: fs.readFileSync(certConfig.caCert),
  enableHttp2: false,
  onlyHttp2: false,
  allowHTTP1: true,
  minVersion: 'TLSv1.2',
});

// https://nodejs.org/api/http2.html#http2_http2_createsecureserver_options_onrequesthandler
const serverConfig = Object.freeze({
  ...listenerConfig,
  key: fs.readFileSync(certConfig.serverKey),
  cert: fs.readFileSync(certConfig.serverCert),
  ca: fs.readFileSync(certConfig.caCert),
  enableHttp2: true,
  onlyHttp2: false,
  minVersion: 'TLSv1.2',
  requestCert: true,
  allowHTTP1: true,
  rejectUnauthorized: true, // if enabled you cannot do authentication based on client cert
  checkClientCertificate: true // GRPC_SSL_REQUEST_AND_REQUIRE_CLIENT_CERTIFICATE_AND_VERIFY
  // enableTrace: true, // Debug errors if required
  // passphrase: '123456', // Pass if SERVER_key.pem requires
});

const CA = Object.freeze({
  attrs: [
    {
      name: 'commonName',
      value: 'Local Certificate Authority'
    },
    {
      name: 'countryName',
      value: 'US'
    },
    {
      shortName: 'ST',
      value: 'Virginia'
    },
    {
      name: 'localityName',
      value: 'Blacksburg'
    },
    {
      name: 'organizationName',
      value: 'CA LTD'
    },
    {
      shortName: 'OU',
      value: 'Local Cert Auth'
    }
  ],
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 6, // URI
          value: 'http://localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        }
      ]
    },
    {
      name: 'subjectKeyIdentifier'
    }
  ]
});

const SERVER = Object.freeze({
  attrs: [{
    name: 'commonName',
    value: serverConfig.host
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Virginia'
  }, {
    name: 'localityName',
    value: 'Blacksburg'
  }, {
    name: 'organizationName',
    value: serverConfig.host,
  }, {
    shortName: 'OU',
    value: serverConfig.host
  }],
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 6, // URI
          value: 'http://localhost'
        },
        {
          type: 7, // IP
          ip: '127.0.0.1'
        }
      ]
    },
    {
      name: 'subjectKeyIdentifier'
    }
  ]
});

const CLIENT = Object.freeze({
  attrs: [{
    name: 'commonName',
    value: certConfig.clientCN,
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Virginia'
  }, {
    name: 'localityName',
    value: 'Blacksburg'
  }, {
    name: 'organizationName',
    value: 'test client'
  }, {
    shortName: 'OU',
    value: certConfig.clientCN,
  }],
});

const CLIENT2 = Object.freeze({
  attrs: [{
    name: 'commonName',
    value: certConfig.clientCN2,
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Virginia'
  }, {
    name: 'localityName',
    value: 'Blacksburg'
  }, {
    name: 'organizationName',
    value: 'test client'
  }, {
    shortName: 'OU',
    value: certConfig.clientCN2,
  }],
});

module.exports = {
  CA,
  SERVER,
  CLIENT,
  CLIENT2,
  clientConfig,
  serverConfig,
  certConfig
};
