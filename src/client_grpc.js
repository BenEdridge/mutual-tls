// See: https://grpc.io/docs/guides/auth/

'use strict';

const fs = require('fs');
const grpc = require('grpc');
const loader = require('@grpc/proto-loader');
const config = require('./config');

const options = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.clientKey),
  cert: fs.readFileSync(config.env.clientCert),
  ca: fs.readFileSync(config.env.caCert),
};

const credentials = grpc.credentials.createSsl(
  options.ca,
  options.key,
  options.cert
);

const packageDefinition = loader.loadSync(
  `${__dirname}/route_guide.proto`,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

let client = new routeguide.RouteGuide(`${options.host}:${options.port}`, credentials);

// Send message to gRPC server and return response from server

const request = {
  data: {
    message: 'Hello from mutual TLS gRPC client'
  }
};

client.message(request, (error, response) => {
  if (error) {
    return console.error(error);
  }
  console.log(`gRPC Server response: ${JSON.stringify(response)}`);
});

// I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
process.on('unhandledRejection', (reason, p) => { throw reason });

// Not good! An uncaught exception!
process.on('uncaughtException', (error) => {
  console.error('uncaughtException :/', error)
  process.exit(1);
});