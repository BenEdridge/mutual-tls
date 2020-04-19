// See: https://grpc.io/docs/quickstart/node/
'use strict';

const grpc = require('grpc');
const loader = require('@grpc/proto-loader');
const options = require('./config').serverConfig();

const credentials = grpc.ServerCredentials.createSsl(
  options.ca,
  [{
    private_key: options.key,
    cert_chain: options.cert
  }],
  options.checkClientCertificate // GRPC_SSL_REQUEST_AND_REQUIRE_CLIENT_CERTIFICATE_AND_VERIFY
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

const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide

const init = () => {

  const server = new grpc.Server();
  server.addService(routeguide.RouteGuide.service, {
    message
  });

  server.bind(`${options.host}:${options.port}`, credentials);
  server.start();

  console.log(`gRPC server listening on ${options.host} and port ${options.port}`);

  return server;
}

const message = (context, callback) => {
  console.log('gRPC Client Request: ', context.request);
  const response = {
    data: {
      message: 'Hello from mutual TLS gRPC Server'
    }
  };
  callback(null, response);
};

module.exports = {
  init
};