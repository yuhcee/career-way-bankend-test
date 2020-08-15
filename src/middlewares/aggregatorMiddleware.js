import Joi from '@hapi/joi';
import {
  joyValidate,
  catchUniqueViolations,
  destructureRequestBody,
} from './helpers';
import db from '../database/models';
import CustomResponse from '../utils/CustomResponse';
const { Aggregator, Otp, PaymentType } = db;

export const validateAggregatorDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const aggregatorRegisterSchema = Joi.object({
      companyName: Joi.string().trim().required(),
      phoneNumber: Joi.string().trim().required(),
      email: Joi.string().email().trim().required(),
      businessYears: Joi.number().integer().required(),
      websiteLink: Joi.string().trim().required(),
      accountNumber: Joi.number().required(),
      percentage: Joi.number(),
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
    error = await joyValidate(aggregatorRegisterSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    error = await catchUniqueViolations(req, 'aggregators', [
      'accountNumber',
      'email',
    ]);
    if (error) return Res.status(409).encryptAndSend({ error });

    const { email } = req.body;
    req.email = email;

    return next();
  } catch (error) {
    return next(error.message);
  }
};
export const validateAggregatorPatchRequest = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;

    const aggregatorRegisterSchema = Joi.object({
      companyName: Joi.string().trim(),
      phoneNumber: Joi.string().trim(),
      email: Joi.string().email().trim(),
      businessYears: Joi.number().integer(),
      websiteLink: Joi.string().trim(),
      bankType: Joi.string()
        .trim()

        .valid('accessBank', 'otherBanks'),
      bvn: Joi.string().trim(),
      accountNumber: Joi.number(),
      address: Joi.string().trim(),
    });
    error = await joyValidate(aggregatorRegisterSchema, req);
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

export const validateAggregatorEmail = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const aggregatorIdSchema = Joi.object({
      email: Joi.string().email().trim().required(),
    });
    const error = await joyValidate(aggregatorIdSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { email } = req.body;
    const aggregator = await Aggregator.findOne({ where: { email } });
    if (!aggregator) {
      return Res.status(404).encryptAndSend({
        error: `we could not find the email ${email} in our system; please signup first`,
      });
    }

    const { id } = aggregator.dataValues;

    req.email = email;
    req.aggregatorId = id;

    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const formatAggregatorReqBody = (req, res, next) => {
  try {
    req.formattedRequest = destructureRequestBody(req.body);
    req.email = req.body.email;
    return next();
  } catch (error) {
    return next(error.messsage);
  }
};

export const checkAggregatorVerificationDetails = async (req, res, next) => {
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

export const rejectUnverifiedAggregators = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;
    const { aggregatorId } = req.params;
    const { email } = req.body;
    let aggregator;

    if (email) {
      aggregator = await Aggregator.findOne({ where: { email } });
    } else if (aggregatorId) {
      const id = aggregatorId;
      aggregator = await Aggregator.findOne({ where: { id } });
    } else {
      error =
        'expected email in the request body and/or aggregator id in the request params';
      return Res.status(400).encryptAndSend({ error });
    }

    if (!aggregator) {
      return Res.status(401).encryptAndSend({ error: 'Email does not exist' });
    }

    if (aggregator && !aggregator.isVerified) {
      error =
        'this user has not been verified; to proceed, the account must be verified';
      return Res.status(401).encryptAndSend({ error });
    }
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const rejectVerifiedAggregators = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;
    const { aggregatorId } = req.params;
    const { email } = req.body;
    let aggregator;

    if (email) {
      aggregator = await Aggregator.findOne({ where: { email } });
    } else if (aggregatorId) {
      const id = aggregatorId;
      aggregator = await Aggregator.findOne({ where: { id } });
    } else {
      error =
        'expected email in the request body and/or aggregator id in the request params';
      return Res.status(400).encryptAndSend({ error });
    }
    if (aggregator && aggregator.isVerified) {
      error =
        'this user has already been verified. Please use the login endpoint to sign in';
      return Res.status(401).encryptAndSend({ error });
    }
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateAggregatorOtp = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { otp: passCode, email } = req.body;

    let otp;
    try {
      otp = await Otp.findOne({
        where: { passCode },
        attributes: ['passCode', 'expires'],
        include: {
          model: Aggregator,
          as: 'aggregator',
          attributes: ['email', 'id'],
        },
      });
    } catch (error) {
      return Res.status(401).encryptAndSend({ error: 'invaid OTP' });
    }
    const now = new Date();

    if (!otp || !otp.aggregator || otp.aggregator.email !== email) {
      return Res.status(401).encryptAndSend({
        error: 'invalid OTP',
      });
    }

    if (otp.expires < now) {
      return Res.status(401).encryptAndSend({
        error: 'the OTP has expired',
      });
    }

    req.body.aggregatorId = otp.aggregator.id;

    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateAggregatorPercentageCharge = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error;
    const schema = Joi.object({
      aggregatorId: Joi.number().integer().min(1).required(),
      paymentTypeId: Joi.number().integer().min(1).required(),
      percentageCharge: Joi.number().min(0).required(),
    });
    error = await joyValidate(schema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { paymentTypeId } = req.body;
    const { aggregatorId } = req.params;
    const aggregator = await Aggregator.findOne({
      where: { id: aggregatorId },
    });
    if (!aggregator) {
      error = `no aggregator matches the id of ${aggregatorId}`;
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
