import crypto from 'crypto';
import { isEmptyObject } from './helpers';
import db from '../database/models';
import { setDays } from '../utils/dateFunctons';
import { Cypher } from '../utils/Cypher';
import CustomResponse from '../utils/CustomResponse';
const { AES_KEY, IV_KEY, DIRECTMERCHANT_EMAIL } = process.env;
const { Credential, Aggregator, Merchant } = db;

export const generateEncryptionKeys = async (req, res, next) => {
  try {
    let keyLength = 16;
    let aesKey;
    let ivKey;
    let isDuplicateAesKey;
    let isDuplicateIvKey;
    do {
      aesKey = crypto.randomBytes((keyLength * 3) / 4).toString('base64');
      isDuplicateAesKey = await Credential.findOne({ where: { aesKey } });
    } while (isDuplicateAesKey);
    do {
      ivKey = crypto.randomBytes((keyLength * 3) / 4).toString('base64');
      isDuplicateIvKey = await Credential.findOne({ where: { ivKey } });
    } while (isDuplicateIvKey);

    const expires = setDays(30);

    req.encryptionKeys = { aesKey, ivKey, expires };
    return next();
  } catch (error) {
    return next(`Error generating encryption keys: ${error.message}`);
  }
};

export const validateAppID = async (req, res, next) => {
  try {
    const { applicationid: appId } = req.headers;

    if (!appId) {
      return res.status(400).json({
        error: 'Request failed; missing credentials',
        errorCode: '001',
      });
    }
    const userKeys = await Credential.findOne({
      where: { appId },
      include: [
        { model: Aggregator, as: 'aggregator' },
        { model: Merchant, as: 'merchant' },
      ],
      // eslint-disable-next-line no-unused-vars
    }).catch((error) => {
      return null;
    });
    if (!userKeys) {
      return res
        .status(400)
        .json({ error: 'invalid ApplicationID', errorCode: '002' });
    }
    if (userKeys.expires < new Date()) {
      return res.status(400).json({
        error: 'Request failed',
        errorCode: '003',
      });
    }

    const serverCypher = new Cypher(AES_KEY, IV_KEY);
    const userAesKey = serverCypher.decrypt(userKeys.aesKey);
    const userIvKey = serverCypher.decrypt(userKeys.ivKey);
    req.clientCypher = new Cypher(userAesKey, userIvKey);
    req.aggregator = userKeys.aggregator;
    req.merchant = userKeys.merchant;
    req.userKeys = userKeys;
    return next();
  } catch (error) {
    return next(`validateAppID: ${error.message}`);
  }
};

export const allowOnlyAggregators = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    if (!req.aggregator) {
      return Res.status(401).encryptAndSend({
        error: 'access denied',
        errorCode: '004',
      });
    }

    return next();
  } catch (error) {
    return next(`validateAggregatorAppID: ${error.message}`);
  }
};

export const decryptRequestBody = async (req, res, next) => {
  try {
    if (isEmptyObject(req.body)) {
      return next();
    }
    const { data: encryptedData } = req.body;
    if (!encryptedData || typeof encryptedData !== 'string') {
      return res.status(400).json({
        error: 'Request failed. Invalid data',
        errorCode: '005',
      });
    }

    try {
      const decryptedRequestBody = req.clientCypher.decrypt(encryptedData);
      req.body = JSON.parse(decryptedRequestBody);
    } catch (err) {
      return res.status(400).json({
        error: 'data decryption failed',
        erroCode: '006',
      });
    }

    return next();
  } catch (error) {
    return next(`decryptRequestBody: ${error.message}`);
  }
};

/**
 * This middleware prevents an aggregator from registering a merchant
 * under a different aggregator. Only Access Bank Aggregator can register
 * a merchant under a different aggregator (via the Access Gateway UI)
 * @param {req} req
 * @param {res} res
 * @param {next} next
 */
export const validateNewMerchantAGID = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const userKeys = req.userKeys;
    if (!userKeys) {
      throw new Error('"userKeys" is not attached to the req object');
    }
    if (
      userKeys.aggregator &&
      userKeys.aggregator.email !== DIRECTMERCHANT_EMAIL
    ) {
      const aggregator = userKeys.aggregator;
      if (aggregator.agid !== req.body.agid) {
        return Res.status(401).encryptAndSend({
          error: 'applicationID/agid mismatch error',
          errorCode: '007',
        });
      }
    }
    return next();
  } catch (error) {
    return next(`validateMerchantOwnership: ${error.message}`);
  }
};
