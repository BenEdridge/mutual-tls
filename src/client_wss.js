'use strict';

const websocket = require('ws');
const options = require('./config').clientConfig();

const init = () => {

  const ws = new websocket(`wss://${options.host}:${options.port}`, options);

  ws.on('open', () => {
    ws.send('hello');
  });
  
  ws.on('message', (data, isBinary) => {
    const message = isBinary ? data : data.toString();
    console.info(message);
  });
  
  ws.on('unexpected-response', (req, res) => {
    console.info('unexpected-response', req, res);
  });
  
  ws.on('close', (code, data) => {
    const reason = data.toString();
    console.info('WebSocket closed', code, reason);
  });
  
  ws.on('error', (error) => {
    console.error(error);
  });
}

module.exports = {
  init
};