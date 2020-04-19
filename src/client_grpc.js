'use strict';

const grpc = require('grpc');
const loader = require('@grpc/proto-loader');
const options = require('./config').clientConfig();

const init = () => {

  //https://grpc.io/docs/guides/auth
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
};

module.exports = {
  init
};