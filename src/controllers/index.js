/* eslint-disable linebreak-style */
import { Router } from 'express';
import routes from './routes';

const route = Router();

route.use('/', routes);

export default route;



