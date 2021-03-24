/* eslint-disable import/no-unresolved */
import jwt from 'jsonwebtoken';
const { env } = process;


const { BCRYPT_SALT, EXPIRES } = env;
/**
 * Synchronously sign the given payload into a JSON Web Token string.
 * @static
 * @param {string | number | Buffer | object} payload Payload to sign.
 * @param {string | number} expiresIn Expressed in seconds or a string describing a
 * time span. Eg: 60, "2 days", "10h", "7d". Default specified is 1day.
 * @memberof Toolbox
 * @returns {string} JWT token.
 */
export const create = async (payload, expiresIn = EXPIRES) => {
  if (payload && payload.email) delete payload.email;

  try {
    return await jwt.sign(payload, BCRYPT_SALT, {
      expiresIn,
      algorithm: 'HS256',
    });
  } catch (e) {
    return e;
  }
};

/**
 *
 *  Synchronously verify the given JWT token using a secret
 * @param {*} token - JWT token.
 * @returns {string | number | Buffer | object } - Decoded JWT payload if
 * token is valid or an error message if otherwise.
 */
export const verifyToken = async (token) => {
  try {
    return await jwt.verify(token, BCRYPT_SALT, { algorithm: 'HS256' });
  } catch (err) {
    // return Error('Invalid or expired token provided');
    return err;
  }
};
