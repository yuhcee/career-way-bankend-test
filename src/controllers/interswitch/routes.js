import express from 'express';
import { pay } from './controller';

const router = express.Router();

router.post('/pay', pay);

export default router;
