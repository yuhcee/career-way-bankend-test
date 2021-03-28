import server from './server';

import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;

const { log } = console;
// const { server: app } = server;

// ping all external api before starting the server;
server.listen(PORT, function () {
  const server = `http://localhost:${PORT}`;
  console.log('App started on port ' + server);
});
// server.listen(PORT, function () {
//   const { address, port } = this.address();
//   const server = `http://${address === '::' ? '0.0.0.0' : address}:${port}`;
//   log(
//     '\x1b[1m\x1b[31m Server Started ON:',
//     '\x1b[36m\x1b[89m\x1b[4m',
//     server,
//     '\x1b[0m'
//   );
//   log('\x1b[1m\x1b[31m', 'Press Ctrl+C to quit.\n\x1b[0m');
// });

// export default app;
