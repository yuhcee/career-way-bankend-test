import Joi from '@hapi/joi';
import {
  joyValidate,
  catchUniqueViolations,
  destructureRequestBody,
} from './helpers';
import CustomResponse from '../utils/CustomResponse';
import db from '../database/models';

const { Otp, Merchant, PaymentType } = db;

export const validateMerchantDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const merchantRegisterSchema = Joi.object({
      agid: Joi.string().trim().required(),
      companyName: Joi.string().trim().required(),
      phoneNumber: Joi.string().trim().required(),
      email: Joi.string().email().trim().required(),
      businessYears: Joi.number().integer().required(),
      businessType: Joi.string().trim().required(),
      websiteLink: Joi.string().trim().required(),
      accountNumber: Joi.number().required(),
      bvn: Joi.number().optional(),
      address: Joi.string().trim().required(),
      bankType: Joi.string()
        .trim()
        .required()
        .valid('accessBank', 'otherBanks'),
      region: Joi.string()
        .trim()
        .required()
        .valid('LOCAL', 'INTERNATIONAL')
        .required(),
      capAmount: Joi.number().integer().min(100),
      cardPercentageCharge: Joi.number(),
      accountPercentageCharge: Joi.number(),
      primaryContactName: Joi.string().trim().required(),
      primaryContactTelephone: Joi.number().required(),
      primaryContactPhoneNumber: Joi.number().required(),
      primaryContactEmail: Joi.string().email().trim().required(),
      secondaryContactName: Joi.string().trim().required(),
      secondaryContactTelephone: Joi.number().required(),
      secondaryContactPhoneNumber: Joi.number().required(),
      secondaryContactEmail: Joi.string().email().trim().required(),
    });
    error = await joyValidate(merchantRegisterSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    error = await catchUniqueViolations(req, 'merchants', [
      'accountNumber',
      'email',
    ]);
    if (error) return Res.status(409).encryptAndSend({ error });

    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const formatMerchantReqBody = (req, res, next) => {
  try {
    req.formattedRequest = destructureRequestBody(req.body);
    req.email = req.body.email;
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const checkMerchantVerificationDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const schema = Joi.object({
      otp: Joi.string().trim().required(),
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    });
    const error = await joyValidate(schema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const rejectUnverifiedMerchants = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;
    const { merchantId } = req.params;
    const { email } = req.body;
    let merchant;

    if (email) {
      merchant = await Merchant.findOne({ where: { email } });
    } else if (merchantId) {
      const id = merchantId;
      merchant = await Merchant.findOne({ where: { id } });
    } else {
      error =
        'expected email in the request body and/or merchant id in the request params';
      return Res.status(400).encryptAndSend({ error });
    }

    if (!merchant) {
      return Res.status(401).encryptAndSend({ error: 'Email does not exist' });
    }

    if (merchant && !merchant.isVerified) {
      error =
        'this user has not been verified; to proceed, the account must be verified';
      return Res.status(401).encryptAndSend({ error });
    }
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const rejectVerifiedMerchants = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;
    const { merchantId } = req.params;
    const { email } = req.body;
    let merchant;

    if (email) {
      merchant = await Merchant.findOne({ where: { email } });
    } else if (merchantId) {
      const id = merchantId;
      merchant = await Merchant.findOne({ where: { id } });
    } else {
      error =
        'expected email in the request body and/or merchant id in the request params';
      return Res.status(400).encryptAndSend({ error });
    }
    if (merchant && merchant.isVerified) {
      error =
        'this user has already been verified. Please use the login endpoint to sign in';
      return Res.status(401).encryptAndSend({ error });
    }
    req.merchant = merchant;
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateMerchantOtp = async (req, res, next) => {
  const { otp: passCode, email } = req.body;
  const Res = new CustomResponse(req, res);
  let otp;
  try {
    otp = await Otp.findOne({
      where: { passCode },
      attributes: ['passCode', 'expires'],
      include: {
        model: Merchant,
        as: 'merchant',
        attributes: ['email', 'id'],
      },
    });
  } catch (error) {
    return Res.status(401).encryptAndSend({ error: 'invaid OTP' });
  }
  const now = new Date();

  if (!otp || !otp.merchant || otp.merchant.email !== email) {
    return Res.status(401).encryptAndSend({
      error: 'invalid OTP',
    });
  }

  if (otp.expires < now) {
    return Res.status(401).encryptAndSend({
      error: 'the OTP has expired',
    });
  }

  req.body.merchantId = otp.merchant.id;

  return next();
};

export const generateMid = (req, res, next) => {
  try {
    let mid = null;
    const id = req.body.merchantId + '';
    if (id.toString().length < 7) {
      mid = 'ACCESSNG' + '0'.repeat(6 - id.length) + id;
    } else {
      mid = 'ACCESSNG' + id;
    }
    req.body.mid = mid;
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateMerchantEmail = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const merchantSchema = Joi.object({
      email: Joi.string().email().trim().required(),
    });
    const error = await joyValidate(merchantSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { email } = req.body;
    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return Res.status(404).encryptAndSend({
        error: `we could not find the email ${email} in our system; please signup first`,
      });
    }

    const { id } = merchant.dataValues;

    req.email = email;
    req.merchantId = id;

    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateRiskLevel = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const riskLevelSchema = Joi.object({
      riskLevel: Joi.string().valid('low', 'medium', 'high').required(),
    }).options({ stripUnknown: true });
    const error = await joyValidate(riskLevelSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateMerchantPercentageCharge = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error;
    const schema = Joi.object({
      merchantId: Joi.number().integer().min(1).required(),
      paymentTypeId: Joi.number().integer().min(1).required(),
      percentageCharge: Joi.number().min(0).required(),
    });
    error = await joyValidate(schema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { paymentTypeId } = req.body;
    const { merchantId } = req.params;
    const merchant = await Merchant.findOne({
      where: { id: merchantId },
    });
    if (!merchant) {
      error = `no aggregator matches the id of ${merchantId}`;
      return Res.status(404).encryptAndSend({ error });
    }

    const paymentType = await PaymentType.findOne({
      where: { id: paymentTypeId },
    });

    if (!paymentType) {
      error = `no paymentType matches the id of ${paymentTypeId}`;
      return Res.status(404).encryptAndSend({ error });
    }

    return next();
  } catch (error) {
    return next(`validateAggregatroPercentageCharge: ${error.message}`);
  }
};

export const validateMerchantPatchRequest = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const merchantSchema = Joi.object({
      merchantId: Joi.number().integer().min(1),
      capAmount: Joi.number(),
      companyName: Joi.string().trim(),
      phoneNumber: Joi.string().trim(),
      email: Joi.string().email().trim(),
      businessYears: Joi.number().integer(),
      websiteLink: Joi.string().trim(),
      bankType: Joi.string().trim().valid('accessBank', 'otherBanks'),
      bvn: Joi.string().trim(),
      accountNumber: Joi.number(),
      address: Joi.string().trim(),
      region: Joi.string().trim().valid('LOCAL', 'INTERNATIONAL'),
      canPayByAccount: Joi.boolean(),
    });
    error = await joyValidate(merchantSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    error = await catchUniqueViolations(req, 'aggregators', [
      'accountNumber',
      'email',
    ]);
    if (error) return Res.status(409).encryptAndSend({ error });

    return next();
  } catch (error) {
    return next(error.message);
  }
};
