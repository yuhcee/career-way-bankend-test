import Joi from '@hapi/joi';
import { Validate } from '.';

const aggregatorRegisterSchema = Joi.object({
  companyName: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  businessYears: Joi.number().integer().required(),
  websiteLink: Joi.string().trim().required(),
  accountNumber: Joi.number().required(),
  BVN: Joi.number().required(),
  address: Joi.string().trim().required(),
  primaryContactName: Joi.string().trim().required(),
  primaryContactTelephone: Joi.number().required(),
  primaryContactPhoneNumber: Joi.number().required(),
  primaryContactEmail: Joi.string().email().trim().required(),
  secondaryContactName: Joi.string().trim().required(),
  secondaryContactTelephone: Joi.number().required(),
  secondaryContactPhoneNumber: Joi.number().required(),
  secondaryContactEmail: Joi.string().email().trim().required(),
});

const merchantRegisterSchema = Joi.object({
  companyName: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  businessYears: Joi.number().integer().required(),
  websiteLink: Joi.string().trim().required(),
  accountNumber: Joi.number().required(),
  BVN: Joi.number().required(),
  address: Joi.string().trim().required(),
  primaryContactName: Joi.string().trim().required(),
  primaryContactTelephone: Joi.number().required(),
  primaryContactPhoneNumber: Joi.number().required(),
  primaryContactEmail: Joi.string().email().trim().required(),
  secondaryContactName: Joi.string().trim().required(),
  secondaryContactTelephone: Joi.number().required(),
  secondaryContactPhoneNumber: Joi.number().required(),
  secondaryContactEmail: Joi.string().email().trim().required(),
  aggregatorId: Joi.number().required(),
});

const MerchantRegisterValidate = (...args) => Validate(merchantRegisterSchema, ...args);
const AggregatorRegisterValidate = (...args) => Validate(aggregatorRegisterSchema, ...args);

export default {
  MerchantRegisterValidate,
  AggregatorRegisterValidate
};
