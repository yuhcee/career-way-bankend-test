/* eslint-disable import/no-unresolved */
import bcrypt from 'bcrypt';
require('dotenv').config();
const { env } = process;


const { BCRYPT_SALT } = env;
/**
 * Hashes a password
 * @param {string} password - Password to encrypt.
 * @memberof Toolbox
 * @returns {string} - Encrypted password.
 */
export const hash = async (password) => {
  try {
    const salt = Number(BCRYPT_SALT);
    if (Number.isNaN(salt)) throw new Error('The salt is not a number');
    const generatedSalt = await bcrypt.genSalt(Number(BCRYPT_SALT));
    const hashedPassword = await bcrypt.hash(password, generatedSalt);
    return hashedPassword;
  } catch (error) {
    console.log('error', error);
    // // console.log(new Error('error hashing password'));
    throw new Error('error hashing password');
  }
};

/**
 * Compares a password with a given hash
 * @param {string} password - Plain text password.
 * @param {string} hashedPassword - Encrypted password.
 * @returns {Promise<boolean>} - returns true if there is a match and false otherwise.
 */
export const compare = async (password, hashedPassword) => {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  } catch (error) {
    // // console.log(new Error('error comparing passwords'));
    throw new Error('error comparing passwords');
  }
};
