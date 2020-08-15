import random from 'randomatic';
import db from '@models';
const { OTP } = db;

const { OTPLENGTH } = process.env;

export const generateOTP = () => {
  return random('0', OTPLENGTH);
};

export const createOTP = async (
  { aggregatorId },
  passCode,
  email,
  transaction
) => {
  if (OTP.toString().length !== OTPLENGTH) {
    passCode = Number(generateOTP());
  }

  const expires = new Date(Date.now() + 1200000); // 20mins
  const user = await OTP.create(
    { aggregatorId, email, passCode, expires, type: 'register' },
    { transaction }
  );
  return user;
};

export const isOTPexpired = (expiryDate) => {
  return new Date().getTime() > new Date(expiryDate).getTime();
};
export const justUpdated = (updatedAt) => {
  return new Date().getTime() - new Date(updatedAt).getTime() <= 500000;
};
