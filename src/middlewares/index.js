import axios from 'axios';
import Joi from '@hapi/joi';
import { joyValidate } from './helpers';
import CustomResponse from '../utils/CustomResponse';
const { ACCT_VERIFICATION_URL, DIRECTMERCHANT_EMAIL } = process.env;

export const validateQueryParameters = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const querySchema = Joi.object({
      page: Joi.number()
        .integer()
        .min(0)
        .error(new Error('page cannot be negative')),
      pageSize: Joi.number()
        .integer()
        .min(1)
        .error(new Error('pageSize must be greater than 0')),
      status: Joi.string().trim().valid('PENDING', 'SUCCESSFUL', 'FAILED'),
      transactionId: Joi.string(),
      merchantId: Joi.number()
        .integer()
        .min(1)
        .error(new Error('merchantId must be positive integer')),
      aggregatorId: Joi.number()
        .integer()
        .min(1)
        .error(new Error('aggregatorId must be positive integer')),
      from: Joi.date().error(
        new Error('please specify date in the format YYYY-MM-DD')
      ),
      to: Joi.date().error(
        new Error('please specify date in the format YYYY-MM-DD')
      ),
      accountNumber: Joi.number()
        .integer()
        .error(new Error('invalid account number')),
    }).options({ stripUnknown: true });
    const error = await joyValidate(querySchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const verifyAccountNumber = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { accountNumber, bankType } = req.body;
    // check if accountNo is access

    if (bankType === 'accessBank') {
      const body = {
        account_no: accountNumber,
      };

      const { data } = await axios.post(ACCT_VERIFICATION_URL, body, {});
      if (data && data.ResponseCode === '00') {
        if (
          data.getcustomeracctsdetailsresp &&
          data.getcustomeracctsdetailsresp.length &&
          data.getcustomeracctsdetailsresp[0].BVN
        ) {
          req.body.bvn = data.getcustomeracctsdetailsresp[0].BVN;
          return next();
        }
        return Res.status(400).encryptAndSend({
          error: 'This account does not have a bvn.',
        });
      } else {
        return Res.status(400).encryptAndSend({
          error:
            'invalid account number. Please provide a valid ACCESS BANK account number',
        });
      }
    }
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const verifyAccessAccountNumber = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { accountNumber } = req.body;
    // check if accountNo is access

    const body = {
      account_no: accountNumber,
    };

    const { data } = await axios.post(ACCT_VERIFICATION_URL, body, {});
    if (data && data.ResponseCode === '00') {
      if (
        data.getcustomeracctsdetailsresp &&
          data.getcustomeracctsdetailsresp.length &&
          data.getcustomeracctsdetailsresp[0].BVN
      ) {
        req.body.bvn = data.getcustomeracctsdetailsresp[0].BVN;
        return next();
      }
      return Res.status(400).encryptAndSend({
        error: 'This account does not have a bvn.',
      });
    }
    return Res.status(400).encryptAndSend({
      error:
            'invalid account number. Please provide a valid ACCESS BANK account number',
    });

  } catch (error) {
    return next(error.message);
  }
};

export const validateApiKey = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const querySchema = Joi.object({
      apiKey: Joi.string()
        .trim()
        .required()
        .error(new Error('Api Key must be required')),
    });
    const error = await joyValidate(querySchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });
    return next();
  } catch (error) {
    return next(error.message);
  }
};

export const confirmAggregatorOwnsMerchant = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);

    if (
      req.aggregator &&
      req.merchant &&
      req.aggregator.id !== req.merchant.aggregatorId &&
      req.aggregator.email !== DIRECTMERCHANT_EMAIL
    ) {
      return Res.status(401).encryptAndSend({
        error: 'access denied; merchant belongs to a different aggregator',
      });
    }

    return next();
  } catch (error) {
    return next(`confirmAggregatorOwnsMerchant: ${error.message}`);
  }
};

// export const validateAggregatorAgid = async (req, res, next) => {
//   try {
//     const Res = new CustomResponse(req, res);
//     const { agid } = req.body;
//     if (!agid) {
//       return Res.status(400).encryptAndSend({
//         erro: 'you must specify the agid in the request body',
//       });
//     }
//     const aggregator = await Aggregator.findOne({ where: { agid } });
//     if (!aggregator) {
//       return Res.status(404).encryptAndSend({
//         error: `no aggregator matches the agid of ${agid}`,
//       });
//     }
//     req.aggreagorByAgid = aggregator;
//     return next;
//   } catch (error) {
//     return next(`getAggregatorByAgid: ${error.message}`);
//   }
// };
