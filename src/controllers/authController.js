import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtConfig from '../shared/security/jwt';
import db from '../database/models';
import roles from '../shared/security/roles';
import { getSocialPayAndDirectMerchantId } from './helpers';
import { encrypt } from '../shared/security/password';
import { checkUserStatus } from '../middlewares/helpers';
import CustomResponse from '../utils/CustomResponse';

const {
  JWT_SECRET,
  STAFF_LOGIN_KEY,
  STAFF_LOGIN_CHANNEL,
  LOGIN_URL,
  AUTH_TOKEN,
} = process.env;

const {
  Aggregator,
  AggregatorPassword,
  Merchant,
  MerchantPassword,
  AggregatorPrimaryContact,
  AggregatorSecondaryContact,
  MerchantPrimaryContact,
  MerchantSecondaryContact,
} = db;

export const loginMerchant = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { email, password } = req.body;

    const merchant = await Merchant.findOne({
      where: { email },
      include: [
        { model: MerchantPassword, as: 'password', attributes: ['password'] },
        { model: Aggregator, as: 'aggregator' },
      ],
      raw: true,
      nest: true,
    });
    if (!merchant) {
      return Res.status(401).encryptAndSend({ error: 'invalid credentials' });
    }
    const error = checkUserStatus(merchant);
    if (error) {
      return Res.status(401).encryptAndSend({ error });
    }
    if (merchant.aggregator) {
      const error = checkUserStatus(merchant.aggregator);
      if (error) {
        return Res.status(401).encryptAndSend({
          error:
            'access denied because your aggregator is not enabled; please contact administrator',
        });
      }
    }
    const isCorrectPassword = bcrypt.compareSync(
      password,
      merchant.password.password
    );
    if (merchant && isCorrectPassword) {
      const token = jwtConfig.generateToken({
        merchantId: merchant.id,
        role: roles.merchant,
      });
      return Res.status(200).encryptAndSend({
        message: 'login successful',
        merchant: { ...merchant, role: 'merchant', password: undefined },
        token,
      });
    } else {
      return Res.status(401).encryptAndSend({ error: 'invalid credentials' });
    }
  } catch (error) {
    return next(error.message);
  }
};

export const loginAggregator = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { email, password } = req.body;

    const aggregator = await Aggregator.findOne({
      where: { email },
      include: [
        { model: AggregatorPassword, as: 'password', attributes: ['password'] },
      ],
      raw: true,
      nest: true,
    });
    if (!aggregator) {
      return Res.status(401).encryptAndSend({ error: 'invalid credentials' });
    }
    const error = checkUserStatus(aggregator);
    if (error) {
      return Res.status(401).encryptAndSend({ error });
    }
    const isCorrectPassword = bcrypt.compareSync(
      password,
      aggregator.password.password
    );
    if (aggregator && isCorrectPassword) {
      const token = jwtConfig.generateToken({
        aggregatorId: aggregator.id,
        role: roles.aggregator,
      });
      return Res.status(200).encryptAndSend({
        message: 'login successful',
        aggregator: { ...aggregator, role: 'aggregator', password: undefined },
        token,
      });
    } else {
      return Res.status(401).encryptAndSend({ error: 'invalid credentials' });
    }
  } catch (error) {
    return next(error.message);
  }
};

export const loginAdmin = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { username, password } = req.body;
    if (!username || !password) {
      return Res.status(400).encryptAndSend({
        error: 'missing fields username and/or password.',
      });
    }
    const token = jwtConfig.generateToken({ username, role: 'admin' });
    const accessBankAggIds = await getSocialPayAndDirectMerchantId();
    return Res.status(200).encryptAndSend({
      message: 'login successful',
      token,
      admin: {
        role: 'admin',
        username,
        ...(accessBankAggIds ? accessBankAggIds : {}),
      },
    });
  } catch (error) {
    return next(error.message);
  }
};

export const staffLogin = async (req, res, next) => {
  const Res = new CustomResponse(req, res);
  const { username, password } = req.body;
  if (!username || !password) {
    return Res.status(400).encryptAndSend({
      error: 'missing fields username and/or password.',
    });
  }
  const body = {
    username,
    password: encrypt(password),
    key: STAFF_LOGIN_KEY,
    channel: STAFF_LOGIN_CHANNEL,
  };

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: AUTH_TOKEN || '',
  };

  try {
    const { data } = await axios.post(LOGIN_URL, body, { headers });

    if (data.userExist) {
      const token = jwtConfig.generateToken({ username, role: 'admin' });
      const accessBankAggIds = await getSocialPayAndDirectMerchantId();
      return Res.status(200).encryptAndSend({
        admin: {
          role: 'admin',
          username,
          ...data,
          ...(accessBankAggIds ? accessBankAggIds : {}),
        },
        token,
      });
    } else {
      return Res.status(401).encryptAndSend({
        error: 'Invalid username and/or password',
      });
    }
  } catch (error) {
    return next(error.message);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    let data;
    const token = req.headers.authorization;
    let newToken;
    if (!token) {
      return Res.status(401).encryptAndSend({ error: 'missing token' });
    }
    try {
      const { aggregatorId, merchantId, username } = jwt.verify(
        token,
        JWT_SECRET
      );
      try {
        if (aggregatorId) {
          const result = await Aggregator.findOne({
            where: { id: aggregatorId },
            include: [
              { model: AggregatorPrimaryContact, as: 'primaryContact' },
              { model: AggregatorSecondaryContact, as: 'secondaryContact' },
            ],
          });
          data = { ...result.dataValues, role: roles.aggregator };
          const error = checkUserStatus(data);
          if (error) {
            return Res.status(401).encryptAndSend({ error });
          }
          newToken = jwtConfig.generateToken({
            aggregatorId: data.id,
            role: roles.aggregator,
          });
        } else if (merchantId) {
          const result = await Merchant.findOne({
            where: { id: merchantId },
            include: [
              { model: MerchantPrimaryContact, as: 'primaryContact' },
              { model: MerchantSecondaryContact, as: 'secondaryContact' },
            ],
          });
          data = { ...result.dataValues, role: roles.merchant };
          const error = checkUserStatus(data);
          if (error) {
            return Res.status(401).encryptAndSend({ error });
          }
          newToken = jwtConfig.generateToken({
            merchantId: data.id,
            role: roles.merchant,
          });
        } else {
          const body = {
            active_directoryid: username,
          };
          // const result = (await axios.post(AUTHORIZATION_URL, body, {})).data;
          const accessBankAggIds = await getSocialPayAndDirectMerchantId();
          (data = {
            role: roles.admin,
            username,
            ...(accessBankAggIds ? accessBankAggIds : {}),
          }),
            (newToken = jwtConfig.generateToken({
              username,
              role: roles.admin,
            }));
        }
        return Res.status(200).encryptAndSend({
          message: 'successful',
          data: {
            data,
            token: newToken,
          },
        });
      } catch (error) {
        return next(error.message);
      }
    } catch (error) {
      return Res.status(401).encryptAndSend({ error: 'invalid/expired token' });
    }
  } catch (error) {
    return next(error.message);
  }
};
