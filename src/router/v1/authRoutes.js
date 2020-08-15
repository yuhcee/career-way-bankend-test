import express from 'express';
import { getProfile } from '../../controllers/authController';
import { validateAppID } from '../../middlewares/cryptoMiddleware';

const router = express.Router();

router.get('/profile', validateAppID, getProfile);

export default router;
