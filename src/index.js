import server from './app';
const db = require('./database/models');
// const registerSocialPay = require('./utils/registerSocialPay');

const PORT = process.env.PORT || 3300;

const { log } = console;

const dbconnection = db.sequelize;
dbconnection
  .authenticate()
  .then(async () => {
    log(
      '\n\x1b[32m---@',
      '\x1b[1m\x1b[5m',
      'connection to database successful',
      '\x1b[0m\x1b[32m@---'
    );
    server.server.listen(PORT, function () {
      const { address, port } = this.address();
      const server = `http://${address === '::' ? '0.0.0.0' : address}:${port}`;
      log('\n\nServer Started ON:', '\x1b[36m\x1b[89m', server);
      log('Press Ctrl+C to quit.');
      // log('\n\n\x1b[1m\x1b[31m Server Started ON:', '\x1b[36m\x1b[89m\x1b[4m', server, '\x1b[0m');
      // log('\x1b[1m\x1b[31m', 'Press Ctrl+C to quit.\n\x1b[0m');
    });
  })
  .catch((e) => {
    /* istanbul ignore next */
    throw e.message;
  });
