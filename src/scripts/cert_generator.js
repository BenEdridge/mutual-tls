'use strict';

const fs = require('fs');
const forge = require('node-forge');
const crypto = require('crypto');
const pki = forge.pki;

const { CA, SERVER, CLIENT, env } = require('../config');
const PATH = env.keyPath;

function buildCert(prefix, config, issuer, signer){

  console.log('Building ', prefix, ' ...');
  const kp = pki.rsa.generateKeyPair(env.keySize);
  const cert = pki.createCertificate();
  cert.publicKey = kp.publicKey;

  // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
  // Conforming CAs should ensure serialNumber is: no more than 20 octets,  non-negative (prefix a '00' if your value starts with a '1' bit)
  cert.serialNumber = `00${crypto.randomBytes(4).toString('hex')}`;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  cert.setSubject(config.attrs);

  // Set the CA.attrs as an issuer for both server and client
  if(issuer){
    cert.setIssuer(CA.attrs);
  } else {
    cert.setIssuer(config.attrs);
  }

  if(config.extensions){
    cert.setExtensions(config.extensions);
  }

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
  return { keyPair: kp, certificate: cert }
}

function signCert(cert, keyPair, issuer = 'none', signer = 'none'){
  if(issuer === 'none' && signer === 'none') {
    cert.sign(keyPair.privateKey, forge.md.sha256.create());
  } else {
    cert.sign(signer.privateKey, forge.md.sha256.create());
  }
}

function writeToFile(prefix, cert, keyPair){

  const pem = pki.certificateToPem(cert);
  try {
    fs.writeFileSync(`${PATH}/${prefix}.crt`, pem, 'utf8');
    fs.writeFileSync(`${PATH}/${prefix}_key.pem`, pki.privateKeyToPem(keyPair.privateKey), 'utf8');
  } catch (e) {
    console.error('Error writing files out', e);
  }
  console.log('Output files',`${PATH}/${prefix}.crt`, ' and ', `${PATH}/${prefix}_key.pem`);
}

function buildAndWriteP12(prefix, privateKey, cert, password){
  console.log('Building P12', prefix, ' ...');
  // generate a p12 that can be imported by Chrome/Firefox/iOS
  // (requires the use of Triple DES instead of AES)
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, cert, password, { algorithm: '3des' });
  const der = forge.asn1.toDer(p12Asn1).getBytes();
  fs.writeFileSync(`${PATH}/${prefix}.p12`, der, 'binary');
  console.log('Output file',`${PATH}/${prefix}.p12 with PASSWORD: ${password}`);
}

try {
  fs.mkdirSync(`${PATH}`);
} catch (e) {
  console.log("Key directory exists");
}

const dataCA = buildCert('CA', CA);
const client = buildCert('CLIENT', CLIENT, CA, dataCA.keyPair);

buildCert('SERVER', SERVER, CA, dataCA.keyPair);
buildAndWriteP12('CLIENT', client.keyPair.privateKey, client.certificate, crypto.randomBytes(4).toString('hex'));
