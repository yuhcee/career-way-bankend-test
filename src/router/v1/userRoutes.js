import express from 'express';
import { login, logOut, signUp, verifyAuth } from '../../controllers/auth';
import { validateLogin, validateSignUp } from '../../validations/validateAuth';

const router = express.Router();

router.post('/signup', validateSignUp, signUp);
router.post('/login', validateLogin, verifyAuth, login);
router.get('/logout', logOut);

export default router;
