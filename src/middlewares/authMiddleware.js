import jwt from 'jsonwebtoken';
import db from '../database/models';
import Joi from '@hapi/joi';
import { joyValidate, checkUserStatus } from './helpers';
import roles from '../shared/security/roles';
const { JWT_SECRET, PAYMENT_SECRET, DIRECTMERCHANT_EMAIL } = process.env;
import * as aesWrapper from '../utils/aesWrapper';
import CustomResponse from '../utils/CustomResponse';
const { Aggregator, Merchant } = db;

/**
 * validates required fields for aggregator and merchant login
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {function} next
 */
export const validateLoginDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const loginSchema = Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().required(),
    });
    let error = await joyValidate(loginSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    return next();
  } catch (error) {
    return next(error.message);
  }
};

/**
 * validates required fields for admin login
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {function} next
 */
export const validateAdminLoginDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const loginSchema = Joi.object({
      username: Joi.string().trim().required(),
      password: Joi.string().trim().required(),
    });
    let error = await joyValidate(loginSchema, req);
    if (error) return Res.status(400).encryptAndSend({ error });

    return next();
  } catch (error) {
    return next(error.message);
  }
};

/**
 * authorize user.
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {function} next
 */
export const authorize = (authorizedRoles) => async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: param1, aggregatorId: param2 } = req.params;
    const merchantId = param1 ? Number(param1) : param1;
    const aggregatorId = param2 ? Number(param2) : param2;
    let authorized;

    const token = req.headers.authorization;
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      let merchant;
      if (merchantId) {
        merchant = await Merchant.findOne({
          where: { id: merchantId },
          include: { model: Aggregator, as: 'aggregator' },
        });
        if (merchant && decodedToken.role === roles.merchant) {
          const error = checkUserStatus(merchant);
          if (error) {
            return Res.status(401).encryptAndSend({ error });
          }
        }
        if (
          merchant &&
          merchant.aggregatorId &&
          decodedToken.role === roles.merchant
        ) {
          const error = checkUserStatus(merchant.aggregator);
          if (error) {
            return Res.status(401).encryptAndSend({
              error:
                'access denied because your aggregator is not enabled; please contact administrator',
            });
          }
        }
        if (
          merchant &&
          merchant.aggregatorId &&
          decodedToken.role === roles.aggregator
        ) {
          const error = checkUserStatus(merchant.aggregator);
          if (error) {
            return Res.status(401).encryptAndSend({ error });
          }
        }
      }

      if (aggregatorId) {
        const aggregator = await Aggregator.findOne({
          where: { id: aggregatorId },
        });
        if (aggregator && decodedToken.role === roles.aggregator) {
          const error = checkUserStatus(aggregator);
          if (error) {
            return Res.status(401).encryptAndSend({ error });
          }
        }
      }
      if (
        // authorize merchant or agggregator
        authorizedRoles.includes(decodedToken.role) &&
        decodedToken.merchantId === merchantId &&
        decodedToken.aggregatorId === aggregatorId
      ) {
        authorized = true;
      } else if (
        // authorize aggregator to access her merchant's resource
        authorizedRoles.includes(decodedToken.role) &&
        merchant &&
        merchant.aggregator.id === decodedToken.aggregatorId
      ) {
        authorized = true;
      } else if (
        // authorize admin as the aggregator for direct merchants
        decodedToken.role === roles.admin &&
        merchant &&
        merchant.aggregator.email === DIRECTMERCHANT_EMAIL
      ) {
        authorized = true;
      } else if (
        //authorize admin
        authorizedRoles.includes(decodedToken.role) &&
        decodedToken.role === roles.admin
      ) {
        authorized = true;
      } else {
        authorized = false;
      }

      if (authorized) {
        req.role = decodedToken.role;
        req.merchantId = decodedToken.merchantId;
        req.aggregatorId = decodedToken.aggregatorId;
        req.username = decodedToken.username;
        return next();
      } else {
        return Res.status(401).encryptAndSend({ error: 'access denied' });
      }
    } catch (error) {
      return Res.status(401).encryptAndSend({ error: 'access denied' });
    }
  } catch (error) {
    return next(error.message);
  }
};

export const verifyAdminSocket = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    try {
      const decodedToken = jwt.verify(socket.handshake.query.token, JWT_SECRET);
      if (decodedToken.role !== 'admin')
        return next(new Error('Authentication error'));
      socket.decoded = decodedToken;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
};

export const paymentAuthentication = (req, res, next) => {
  const value = req.headers;
  // const Res = new CustomResponse(req, res);
  try {
    let data = aesWrapper.separateKeyFromData(
      value.signature,
      value['digest-id']
    );
    data = JSON.parse(aesWrapper.decrypt(data.key, data.message));
    if (data.name === PAYMENT_SECRET) {
      // req.body.request = { ...value, ...req.serverSignature };
      return next();
    }
    return res.status(401).json({
      error: 'Access denied',
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
};

export const passwordDecrypt = (req, res, next) => {
  const value = req.body;
  const Res = new CustomResponse(req, res);
  try {
    let data = aesWrapper.separateKeyFromData(
      value.password,
      value['digestId']
    );
    data = JSON.parse(aesWrapper.decrypt(data.key, data.message));

    if (data) {
      // eslint-disable-next-line no-unused-vars
      const { digestId, ...payload } = req.body;
      payload.password = data;
      req.body = payload;
      return next();
    }
    return Res.status(401).encryptAndSend({
      error: 'password decryption error',
    });
  } catch (e) {
    return Res.status(500).encryptAndSend({
      error: 'password decryption error',
    });
  }
};
