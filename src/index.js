import app from './app';

import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.YOUR_PORT || process.env.PORT || 4000;
const HOST = process.env.YOUR_HOST || '0.0.0.0';

const { log } = console;
// const { server: app } = server;

// var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
// server.listen(server_port, server_host, function () {
//   console.log('Listening on port %d', server_port);
// });

// ping all external api before starting the server;
app.listen(PORT, HOST, () => {
  const server = `http://${HOST}:${PORT}`;
  log(
    '\x1b[1m\x1b[31m App Started ON:',
    '\x1b[36m\x1b[89m\x1b[4m',
    server,
    '\x1b[0m'
  );
  log('\x1b[1m\x1b[31m', 'Press Ctrl+C to quit.\n\x1b[0m');
});
// app.listen(PORT, function () {
//   const { address, port } = this.address();
//   const app = `http://${address === '::' ? '0.0.0.0' : address}:${port}`;
//   log(
//     '\x1b[1m\x1b[31m app Started ON:',
//     '\x1b[36m\x1b[89m\x1b[4m',
//     app,
//     '\x1b[0m'
//   );
//   log('\x1b[1m\x1b[31m', 'Press Ctrl+C to quit.\n\x1b[0m');
// });

// export default app;
