import app from './app';

import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 5000;

const { log } = console;
// const { server: app } = server;

// ping all external api before starting the server;
app.listen(PORT);
const server = `http://localhost:${PORT}`;
log('Server started on port ' + server);
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
