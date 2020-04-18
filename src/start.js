// Dynamic loading of client/server with protocol
const app = require(`./${process.env.TYPE}_${process.env.PROTOCOL}`)

app.init();

// I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});

// Not good! An uncaught exception!
process.on('uncaughtException', (error) => {
  console.error('uncaughtException :/', error)
  process.exit(1);
});