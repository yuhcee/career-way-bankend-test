import express from 'express';
import { reviewAcctInfo } from './controller';

const router = express.Router();

router.post('/', reviewAcctInfo);

export default router;
