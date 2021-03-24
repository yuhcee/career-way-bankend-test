import validation from '../validations';
import { login, signUp } from './validationSchema';

export const validateSignUp = validation(signUp);
export const validateLogin = validation(login);
