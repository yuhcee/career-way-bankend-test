import express from 'express';
import { handleForm } from '../../middlewares/fileware';

const router = express.Router();

router.post('/compare', handleForm);

export default router;
