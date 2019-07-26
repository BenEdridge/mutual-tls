const CA = {
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
            value: 'http://example.org/webid#me'
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
};

const SERVER = {
  attrs: [{
    name: 'commonName',
    value: 'localhost'
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
    value: 'localhost'
  }, {
    shortName: 'OU',
    value: 'localhost'
  }]
};

const CLIENT = {
  attrs: [{
    name: 'commonName',
    value: 'client_1'
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
    value: 'client_1'
  }],
};

module.exports = {
  CA,
  SERVER,
  CLIENT,
};