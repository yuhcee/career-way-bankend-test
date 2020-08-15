const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
// const swaggerUi = require('swagger-ui-express');
import http from 'http';
import Notif from './utils/Notification';

const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// const swaggerDoc = require('./swagger.json');

import v1Routes from './router';

dotenv.config();
const app = express();

// const corsOptions = {
//   origin: '*',
//   credentials: true,
//   methods: 'POST',
//   preflightContinue: false,
//   optionsSuccessStatus: 204,
// };

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log only 4xx and 5xx responses to console
app.use(
  morgan('dev', {
    skip: () => (process.env.NODE_ENV === 'test' ? true : false),
  })
);
app.use(express.static(path.join(__dirname, '../doc')));
app.use(express.static(path.join(__dirname, '../dev-doc')));

// log all requests to access.log
if (process.env.NODE_ENV === 'production') {
  const date = new Date();
  const filename =
    date.getDay() +
    '-' +
    date.getMonth() +
    '-' +
    date.getFullYear() +
    'access_gate_way.logs';
  app.use(
    morgan('common', {
      skip: (req, res) => res.statusCode < 400,
      stream: fs.createWriteStream(path.join(__dirname, filename), {
        flags: 'a',
      }),
    })
  );
}

app.use('/api/v1/', v1Routes);
app.use((error, req, res, next) => {
  if (error) {
    res.status(500).json({ error, errorCode: '999' });
  } else {
    next();
  }
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.all('/doc', function (req, res) {
  res.sendFile(path.join(__dirname, '../doc/index.html'));
});
app.all('/dev-doc', function (req, res) {
  res.sendFile(path.join(__dirname, '../dev-doc/index.html'));
});

app.all(['/', '/ping'], function (req, res) {
  res.status(200).json('success');
});

app.use(function (req, res) {
  res.status(404).json('dead');
});

const server = http.createServer(app);
const Notification = new Notif(server);
Notification.start();
export default { app, server, Notification };
