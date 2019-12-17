'use strict';

const keyPathENV = process.env.KEY_PATH || './keys';

const env = Object.freeze({
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || 8443,
  rejectUnauthorized: true,
  enableHttp2: false,
  onlyHttp2: false,
  allowHTTP1: true,
  minVersion: 'TLSv1.2',
  keyPath: keyPathENV,
  keySize: 2048,
  caCert: `${keyPathENV}/CA.crt`,
  serverKey: `${keyPathENV}/SERVER_key.pem`,
  serverCert: `${keyPathENV}/SERVER.crt`,
  clientKey: `${keyPathENV}/CLIENT_key.pem`,
  clientCert: `${keyPathENV}/CLIENT.crt`,
  clientCN: 'client_1',
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
    value: env.host
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
    value: env.host,
  }, {
    shortName: 'OU',
    value: env.host
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
    value: env.clientCN,
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
    value: env.clientCN,
  }],
});

module.exports = {
  CA,
  SERVER,
  CLIENT,
  env,
};
