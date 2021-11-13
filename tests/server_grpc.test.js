'use strict';

const tap = require('tap');

const grpc = require('grpc');
const loader = require('@grpc/proto-loader');
const fs = require('fs');

const config = require('../src/config').clientConfig();

const badOptions = {
  host: config.host,
  port: config.port,
  key: fs.readFileSync('./tests/bad_keys/CLIENT_key.pem'),
  cert: fs.readFileSync('./tests/bad_keys/CLIENT.crt'),
  ca: fs.readFileSync('./tests/bad_keys/CA.crt'),
};

const grpcServer = require('../src/server_grpc').init();

const packageDefinition = loader.loadSync(
  `${__dirname}/../src/route_guide.proto`,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

tap.test('gRPC gets a successful response with valid certs', (t) => {

  const credentials = grpc.credentials.createSsl(
    config.ca,
    config.key,
    config.cert
  );

  let client = new routeguide.RouteGuide(`${config.host}:${config.port}`, credentials);

  // Send message to gRPC server and return response from server
  const request = {
    data: {
      message: 'Hello from mutual TLS gRPC client'
    }
  };

  client.message(request, (error, response) => {
    t.equal(response.data.message, 'Hello from mutual TLS gRPC Server');
    t.equal(error, null);
    t.end();
  });
});

tap.test('gRPC returns an error for invalid certs', (t) => {

  const credentials = grpc.credentials.createSsl(
    badOptions.ca,
    badOptions.key,
    badOptions.cert
  );

  let client = new routeguide.RouteGuide(`${config.host}:${config.port}`, credentials);

  // Send message to gRPC server and return response from server
  const request = {
    data: {
      message: 'Hello from mutual TLS gRPC client'
    }
  };

  client.message(request, (error, response) => {
    t.equal(error.details, 'failed to connect to all addresses');
    t.end();
  });

});

tap.teardown(() => {
  grpcServer.forceShutdown();
});