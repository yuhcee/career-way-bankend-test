// import random from 'randomatic';
// import db from '@models';
import db from '../database/models';
const { Otp } = db;
// const { OTPLENGTH } = process.env;

/**
 * // generates otp
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns next
 */

export const generateOTP = async (req, res, next) => {
  try {
    let passCode;
    let isDuplicatePasscode;
    do {
      const min = 10000;
      const max = 99900;
      passCode = Math.floor(Math.random() * (max - min) + min);
      isDuplicatePasscode = await Otp.findOne({ where: { passCode } });
    } while (isDuplicatePasscode);

    const expires = new Date(Date.now() + 1200000);
    req.otp = { passCode, expires };
    return next();
  } catch (error) {
    return next(error.message);
  }
};
