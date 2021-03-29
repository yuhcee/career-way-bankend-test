const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');

import routes from './router';
import response from './utils/response';

dotenv.config();
const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
    limitHandler: (req, res) => {
      return response(res, 400, 'file should not be greater than 1MB');
    },
  })
);

app.use(
  morgan('dev', {
    skip: () => (process.env.NODE_ENV === 'test' ? true : false),
  })
);
app.use(express.static(path.join(__dirname, '../doc')));
app.use(express.static(path.join(__dirname, '../dev-doc')));

app.use('/api', routes);

app.use((error, req, res, next) => {
  if (error) {
    res.status(500).json({ error, errorCode: '999' });
  } else {
    next();
  }
});

app.all(['/', '/ping'], function (req, res) {
  res.status(200).json({ message: "Welcome to the Assistant's Application" });
});

app.use(function (req, res) {
  res.status(404).json({ error: 'path not found' });
});

export default app;
