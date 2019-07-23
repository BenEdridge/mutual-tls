const fs = require('fs');
const forge = require('node-forge');
const pki = forge.pki;

const { CA, SERVER, CLIENT } = require('./config');
const PATH = './keys';

function buildCertAndKey(prefix, config){
    console.log('Building ', prefix, ' ...')
    const keyPair = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    populateCert(prefix, config, cert, keyPair.privateKey);
};

function populateCert(prefix, c, cert, privateKey){
  // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
  // Conforming CAs should ensure serialNumber is: no more than 20 octets,  non-negative (prefix a '00' if your value starts with a '1' bit)
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  cert.setSubject(c.attrs);
  cert.setIssuer(c.attrs);
  // cert.setExtensions(conf.conf.extension);

  /* optionally add more extensions 
  extensions.push.apply(extensions, [{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }]);
  cert.setExtensions(extensions);
  */

  cert.sign(privateKey);
  const pem = pki.certificateToPem(cert);

  fs.writeFileSync(`${PATH}/${prefix}.crt`, pem, 'utf8');
  fs.writeFileSync(`${PATH}/${prefix}_key.pem`, pki.privateKeyToPem(privateKey), 'utf8');

  console.log('Output files',`${PATH}/${prefix}.crt`, ' and ', `${PATH}/${prefix}_key.pem`);
};

buildCertAndKey('CA', CA);
buildCertAndKey('CLIENT', CLIENT);
buildCertAndKey('SERVER', SERVER);