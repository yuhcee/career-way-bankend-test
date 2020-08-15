import Joi from '@hapi/joi';
import { joyValidate } from './helpers';
import CustomResponse from '../utils/CustomResponse';
import db from '../database/models';

const {
  Merchant,
  Transaction,
  DirectMerchantMID,
  SocialpayMID,
  ExternalMerchantMID,
} = db;

export const validateRegistrationDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let error = null;
    const transactionCreationSchema = Joi.object({
      transactionId: Joi.string().trim().length(16).required(),
      apiKey: Joi.string().trim().required(),
      amount: Joi.number().required(),
      cardHolder: Joi.string(),
      ip: Joi.string().trim().required(),
      type: Joi.string().valid('VISA', 'MASTERCARD', 'VERVE'),
      channel: Joi.string().trim().required(),
      fee: Joi.string().number().integer().required(),
      switchFee: Joi.number().integer().required(),
      transactionRef: Joi.string().trim().required(),
      orderId: Joi.string().trim().required(),
      submitTimeUtc: Joi.string().trim().required(),
      aggregatorId: Joi.number().integer().required(),
      details: Joi.string().trim().required(),
      reversalId: Joi.string().trim().required(),
    });
    error = await joyValidate(transactionCreationSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    const { apiKey, transactionId, reconciliationId } = req.body;
    /**
     * Possible breaking change next line
     */
    const merchant = await Merchant.findOne({
      where: { apiKey },
      include: [
        { model: DirectMerchantMID, as: 'directMID' },
        { model: SocialpayMID, as: 'socialpayMID' },
        { model: ExternalMerchantMID, as: 'externalMID' },
      ],
    });
    if (!merchant) {
      error = 'no merchant matches the specified mid';
      return Res.status(403).encryptAndSend({ error });
    }

    const transaction = await Transaction.findOne({ where: { transactionId } });
    if (transaction) {
      error = `transaction ${transactionId} already exists; duplicate transactions are not allowed; use the 'update' route to update a transaction`;
      return Res.status(409).encryptAndSend({ error });
    }

    if (reconciliationId) {
      const transaction = await Transaction.findOne({
        where: { reconciliationId },
      });
      if (transaction) {
        const error =
          'unique violation error: reconcialiationId must be unique for each successful/failed transaction;';
        return Res.status(409).encryptAndSend({ error });
      }
    }

    /**
     * The following addition was added because,
     * I found out that, after the change to the MID structure,
     * the former create transacton stopped working,
     * I had to check for the MID in teh other ables
     * also, the transaction data, keep asking for a merchantId, so I passed it in also.
     * feel free to 'git blame' if it's a breaking change
     */
    const {
      socialpayMID,
      directMID,
      externalMID,
      ...merchantInfo
    } = merchant.dataValues;
    req.body.mid =
      (socialpayMID && socialpayMID.mid) ||
      (directMID && directMID.mid) ||
      (externalMID && externalMID.mid);
    req.body.merchantId = merchantInfo.id;
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateGroupbyQuery = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const querySchema = Joi.object({
      groupby: Joi.string().trim().required().valid('status', 'month'),
    });
    const error = await joyValidate(querySchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const validateTransactionUpdate = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const querySchema = Joi.object({
      status: Joi.string().trim().required().valid('SUCCESSFUL', 'FAILED'),
      reconciliationId: Joi.string().trim().required(),
      transactionId: Joi.string().trim().required(),
    });
    const error = await joyValidate(querySchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });
    return next();
  } catch (error) {
    return next(error.message);
  }
};

const transactionMiddleware = {
  validateRegistrationDetails,
};

export default transactionMiddleware;
