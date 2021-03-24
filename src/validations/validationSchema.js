/* eslint-disable linebreak-style */
import joi from '@hapi/joi';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,})/;

const firstName = joi
  .string()
  .trim()
  .regex(/^([A-Za-z]){5,}$/)
  .min(5)
  .required()
  .error(
    new Error(
      'Username must be minimum of 2 characters long, no spaces and contain alphabet only'
    )
  );
const lastName = joi
  .string()
  .trim()
  .regex(/^([A-Za-z]){5,}$/)
  .min(5)
  .required()
  .error(
    new Error(
      'Username must be minimum of 2 characters long, no spaces and contain alphabet only'
    )
  );
const password = joi
  .string()
  .regex(PASSWORD_REGEX)
  .required()
  .error(
    new Error(
      'password must be a minimum of 5 characters long, must contain a lowercase, an uppercase, a number and a special character'
    )
  );
  
export const signUp = {
  firstName,
  lastName,
  email: joi.string().email(),
  password,
};

export const login = {
  email: joi.string().email(),
  password,
};
