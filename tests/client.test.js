const tap = require('tap');
const conf = require('../src/config');

tap.tearDown(() => {
  console.log('Tearing down')
})