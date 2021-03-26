import response from '../utils/response';
import { getUserById, register, signIn } from '../services/user';
import * as jwt from '../utils/jwt';

let blacklistedTokens = [];

export const signUp = async (req, res) => {
  try {
    if (Object.entries(req.body).length <= 3) {
      return response(res, 400, 'All fields are required');
    }
    const user = await register(req.body);

    if (user.status > 300) {
      return response(res, 400, user.message);
    }
    return response(res, 201, user);
  } catch (error) {
    return response(res, 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    if (Object.entries(req.body).length <= 1) {
      return response(res, 400, 'All fields are required');
    }
    const { email, password } = req.body;
    const user = await signIn(email, password);
    if (!user.error) return response(res, 200, user);

    return response(res, 401, user.message);
  } catch (error) {
    return response(res, 500, error);
  }
};

export const logOut = async (req, res) => {
  //   try {
  const [, token] = req.headers.authorization.split(' ');

  blacklistedTokens.push(token);
  console.log('blacklistedTokens LOGOUT', blacklistedTokens);

  return response(res, 200, 'You have been logged out successfully');
  //   } catch (error) {
  //     return response(res, 500, error);
  //   }
};

export const verifyAuth = async (req, res, next) => {
  const [, token] = req.headers.authorization.split(' ');
  // check if token is blacklisted
  if (blacklistedTokens.includes(token))
    return response(
      res,
      401,
      'You are currently logged out. Log in again to continue'
    );
  // verify token
  // check if token has expired
  const tokenData = await jwt.verifyToken(token);
  if (tokenData.message) return response(res, 401, 'Invalid or expired token');

  const user = await getUserById(tokenData.id);

  if (!user) return response(res, 401, 'User does not exist');
  return next();
};
