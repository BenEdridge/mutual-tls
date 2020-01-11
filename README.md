# Mutual TLS server and client in NodeJS

![](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSL.xcf/800px-SSL.xcf.png)  
Nicobon [CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0)]

![](https://github.com/BenEdridge/Mutual_TLS/workflows/CI/badge.svg)

A better and more complete example of Mutual TLS authentication in NodeJS for HTTPS and WebSockets

- Server and Client in HTTP1/HTTP2
- Certificate generation using `OpenSSL` or `Forge` 
- Documentation for clients (Windows, Linux, OSX, Android)
- Docker image for testing
- No library bloat (3 Libraries)

## Getting Started

Install
```
npm install
```

Generate Certificates and Private Keys
```
# Interactive
npm run generate:keys-openssl

# Automatic (Primarily for testing)
npm run generate:keys-forge
```

Connect
```
npm run start:server

# Connect to the above locally via HTTP2
npm run start:client2

# Connect via WebSockets
npm run start:clientwss
```

## Docker

[Docker](https://github.com/BenEdridge/Mutual_TLS/packages/57880) image:
```
docker pull docker.pkg.github.com/benedridge/mutual_tls/mutual_tls:latest
docker run --name mutual_tls -p 127.0.0.1:8443:8443 -d docker.pkg.github.com/benedridge/mutual_tls/mutual_tls:latest
```

## Keys and Certificates

The generator scripts will create certificates and private keys in the `keys` directory as follows

- Certificates:
  - CA.crt
  - CLIENT.crt
  - SERVER.crt

- **Private Keys (DO NO EXPOSE OR USE IN PROD)**:
  - CA_key.pem
  - CLIENT_key.pem
  - SERVER_key.pem

These certificates and keys need to be imported and loaded into the browser/OS keychains:

# Browser and OS Connectivity

Browse to: `localhost:8443` and you should be requested to supply a certificate or should connect automatically if the `CA` and `Client` certificates have been imported to your browser/OS.

### OSX

OSX typically requires the relevant keys to be imported into the keychain:

See `security --help` for additional options

```
security import CA.crt -k ~/Library/Keychains/login.keychain

security import CLIENT.crt -k ~/Library/Keychains/login.keychain
security import CLIENT_key.pem -k ~/Library/Keychains/login.keychain

security import SERVER.crt -k ~/Library/Keychains/login.keychain
```

Safari and Chrome should work once keys have been trusted and key preferences set to hostname.

Firefox has it's own keystore that doesn't like PEM formatted keys and prefers p12 format.
So you will need to import the `CLIENT.p12` file using the password from the generator output in the `console`.

See below:
`about:preferences#privacy` then `view certificates`

### Linux

CA import for Ubuntu

1. Rename `CA.crt` and copy to `/usr/local/share/ca-certificates/`
2. `chmod 644 CA.cr`
3. Run `sudo update-ca-certificates`

### Android

- Transfer the `CA.crt` and `CLIENT.p12` file to your device
- Settings -> Security -> Device Administrator and Credentials -> Install from SD card etc.

### Windows (WIP)

```
certutil -enterprise -f -v -AddStore "Root" <Cert File path>
```

See: 
https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/certutil

## Resources
- https://intown.biz/2016/11/22/node-client-auth/
- https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2
- https://gist.github.com/pcan/e384fcad2a83e3ce20f9a4c33f4a13ae

## Attributions

Social media image:
Nicobon [CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0)]
