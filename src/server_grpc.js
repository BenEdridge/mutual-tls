// See: https://grpc.io/docs/quickstart/node/

'use strict';

const fs = require('fs');
const grpc = require('grpc');
const loader = require('@grpc/proto-loader');
const config = require('./config');

const options = {
  host: config.env.host,
  port: config.env.port,
  key: fs.readFileSync(config.env.serverKey),
  cert: fs.readFileSync(config.env.serverCert),
  ca: fs.readFileSync(config.env.caCert),
};

const credentials = grpc.ServerCredentials.createSsl(options.ca, [{
  private_key: options.key,
  cert_chain: options.cert
}],
  true // GRPC_SSL_REQUEST_AND_REQUIRE_CLIENT_CERTIFICATE_AND_VERIFY
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

const gRPCServer = init();
gRPCServer.bind(`${options.host}:${options.port}`, credentials);
gRPCServer.start();

console.log(`gRPC server listening on ${options.host} and port ${options.port}`);

module.exports = {
  gRPCServer
}