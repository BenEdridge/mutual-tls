const fs = require('fs');
const forge = require('node-forge');
const pki = forge.pki;

const { CA, SERVER, CLIENT } = require('./config');
const PATH = './keys';

function buildCert(prefix, config, issuer, signer){

  console.log('Building ', prefix, ' ...');
  const kp = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = kp.publicKey;

  // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
  // Conforming CAs should ensure serialNumber is: no more than 20 octets,  non-negative (prefix a '00' if your value starts with a '1' bit)
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  cert.setSubject(config.attrs);

  // Set the CA.attrs as an issuer for both server and client
  if(issuer){
    cert.setIssuer(CA.attrs);
  } else {
    cert.setIssuer(config.attrs);
  };

  if(config.extensions){
    cert.setExtensions(config.extensions);
  };

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

  signCert(cert, kp, issuer, signer);
  writeToFile(prefix, cert, kp);
  return kp;
};

function signCert(cert, keyPair, issuer = 'none', signer = 'none'){
  if(issuer == 'none' && signer == 'none') {
    cert.sign(keyPair.privateKey);
  } else { 
    cert.sign(signer.privateKey); 
  }
};

function writeToFile(prefix, cert, keyPair){

  const pem = pki.certificateToPem(cert);

  fs.writeFileSync(`${PATH}/${prefix}.crt`, pem, 'utf8');
  fs.writeFileSync(`${PATH}/${prefix}_key.pem`, pki.privateKeyToPem(keyPair.privateKey), 'utf8');

  console.log('Output files',`${PATH}/${prefix}.crt`, ' and ', `${PATH}/${prefix}_key.pem`);
};

const keyPair = buildCert('CA', CA);

buildCert('CLIENT', CLIENT, CA, keyPair);
buildCert('SERVER', SERVER, CA, keyPair);