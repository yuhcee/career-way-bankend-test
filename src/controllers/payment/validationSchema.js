import Joi from '@hapi/joi';
import { Validate, ValidateHeader } from '../../middlewares/validations';
import settings from '@settings';

const string = Joi.string().trim();
const amount = Joi.number().integer().positive();
const card = Joi.string().min(14).max(19);

// const accountNumber = Joi.string().min(10).max(10).required();
// const storeName = Joi.string().min(2).required();
// const businessType = Joi.string().min(2).required();
// const userName = Joi.string().regex(/^[a-zA-Z0-9]+$/i).min(2).required();
// const password = Joi.string().min(5).required();
// const id = Joi.number().integer().positive().min(1).required();
// const passCode = Joi.number().integer().positive().min(1000).max(99999).required();
// const reset = Joi.boolean().strict();
const list = (...arr) => Joi.string().valid(...arr);

const paymentRequestSchema = Joi.object({
  cardDetail: Joi.object({
    number: card.required(),
    expirationYear: string.length(2).required(),
    expirationMonth: string.length(2).required(),
    cvv: string.min(3).max(4).required(),
  }).required(),
  amount,
  firstName: string.min(2).required(),
  lastName: string.min(2).required(),
  currency: list('NGN').required(),
});
const paymentDefaultSchema = Joi.object({
  isObject: Joi.boolean().default(true),
  request: Joi.required(),
});
const enrollmentCheckHeaderSchema = Joi.object({
  sid: string.required(),
  [settings.CONSTANT.API_KEY]: string.required(),
  'session-id': string.required(),
  'reference': string.required(),
});

const enrollmentCheckSchema = Joi.object({
  isObject: Joi.boolean().default(true),
  request: paymentRequestSchema.required(),
});
const PayValidate = (...args) => Validate(paymentRequestSchema, ...args);
const DefaultPaymentValidate = (...args) =>
  Validate(paymentDefaultSchema, ...args);
const EnrollmentCheckHeaderValidation = (...args) =>
  ValidateHeader(enrollmentCheckHeaderSchema, ...args);
const EnrollmentCheckPaymentValidation = (...args) =>
  Validate(enrollmentCheckSchema.options({ stripUnknown: true }), ...args);

export default {
  PayValidate,
  DefaultPaymentValidate,
  EnrollmentCheckPaymentValidation,
  EnrollmentCheckHeaderValidation,
};
