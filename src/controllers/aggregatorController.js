import { Op } from 'sequelize';
import CustomResponse from '../utils/CustomResponse';
import db from '../database/models';
import jwt from '../shared/security/jwt';
import { getCustomKey } from '../utils/getCustomKey';
import server from '../app';
import {
  tryRollback,
  paginate,
  filterByDateRange,
  filterByAccountNumber,
  filterByTransactionStatus,
  filterByTransactionId,
  checkAllPasswords,
} from './helpers';
import { sendEmailNotification } from '../shared/service/messaging/mail/bankMail';

const { ADMIN_EMAIL } = process.env;

const {
  Otp,
  sequelize,
  Aggregator,
  AggregatorPrimaryContact,
  AggregatorSecondaryContact,
  AggregatorPassword,
  AggregatorPasswordHistory,
  Merchant,
  MerchantPrimaryContact,
  Transaction,
  SocialpayMID,
  DirectMerchantMID,
  ExternalMerchantMID,
  Credential,
  AggregatorPercentageCharge,
  MerchantPercentageCharge,
  PaymentType,
} = db;

/**
 *  register new aggregator (step 1: save basic aggregator information)
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const registerAggregator = async (req, res, next) => {
  let t = await sequelize.transaction();
  try {
    const Res = new CustomResponse(req, res);
    const {
      formattedRequest: {
        mainDetails,
        primaryContactDetails,
        secondaryContactDetails,
      },
      otp,
      encryptionKeys,
    } = req;
    const newAggregator = await Aggregator.create(mainDetails, {
      transaction: t,
    });

    const { id: aggregatorId } = newAggregator.dataValues;

    const agid = getCustomKey(aggregatorId);
    await newAggregator.update({ agid }, { transaction: t });

    const primaryContact = await AggregatorPrimaryContact.create(
      { ...primaryContactDetails, aggregatorId },
      { transaction: t }
    );

    const secondaryContact = await AggregatorSecondaryContact.create(
      { ...secondaryContactDetails, aggregatorId },
      { transaction: t }
    );

    await Otp.create({ ...otp, aggregatorId }, { transaction: t });
    const credentials = await Credential.create(
      {
        aggregatorId,
        ...encryptionKeys,
      },
      { transaction: t }
    );

    const message = `
      Your Encryption credentials are as follows:\n
      applicationId: ${credentials.appId}\n
      aesKey: ${encryptionKeys.aesKey}\n
      ivKey: ${encryptionKeys.ivKey}\n
      Expires on ${credentials.expires}
    `;
    sendEmailNotification(newAggregator.email, message);

    const response = Res.status(201).encryptAndSend({
      message: 'data successfully saved',
      aggregator: {
        ...newAggregator.dataValues,
        primaryContact,
        secondaryContact,
      },
    });
    await t.commit();
    return response;
  } catch (error) {
    const err = await tryRollback(t);
    if (err) return next(err.message);
    return next(error.message);
  }
};

/**
 * register aggregator, step 2: verify aggregator,
 * savepassword and add password to password history
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const verifyAggregatorAndCreatePassword = async (req, res, next) => {
  let t;
  try {
    const Res = new CustomResponse(req, res);
    t = await sequelize.transaction();
    const { aggregatorId, email, password, otp: passCode } = req.body;
    const aggregator = await Aggregator.findOne({ where: { email } });
    if (!aggregator) {
      return Res.status(404).encryptAndSend({
        error: 'no user matches the specifed email',
      });
    }
    await aggregator.update({ isVerified: true }, { transaction: t });
    await Otp.destroy({ where: { passCode }, transaction: t });
    await AggregatorPassword.upsert(
      { password, aggregatorId },
      { transaction: t }
    );
    await AggregatorPasswordHistory.create(
      { password, aggregatorId },
      { transaction: t }
    );

    const token = jwt.generateToken({ aggregatorId, role: 'aggregator' });

    await t.commit();

    const { companyName, phoneNumber, websiteLink } = aggregator;
    const message = `
      Approval required for a newly created aggregator:\n
      Company Name: ${companyName}\n
      Email: ${email}\n
      Phone Number: ${phoneNumber}\n
      Website Link: ${websiteLink}\n
    `;
    sendEmailNotification(ADMIN_EMAIL, message);

    server.Notification.trigger('get-pending-records', 'pending-aggregator');
    return Res.status(200).encryptAndSend({
      message: 'verification completed successfully',
      aggregator: aggregator,
      token,
    });
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * save aggregator otp
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const saveAggregatorOtp = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId, otp } = req;
    await Otp.upsert({ ...otp, aggregatorId }, { returning: true });
    return Res.status(200).encryptAndSend({
      message: 'The OTP has been sent to your mail',
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * reset aggregator password
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */

export const resetAggregatorPassword = async (req, res, next) => {
  let t;
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId, otp } = req;
    t = await sequelize.transaction();
    // await
    const aggregatorPassword = await AggregatorPassword.findOne({
      where: { aggregatorId },
    });

    await aggregatorPassword.update({ password: '' }, { transaction: t });
    await Otp.upsert({ ...otp, aggregatorId }, { transaction: t });

    await t.commit();

    return Res.status(200).encryptAndSend({
      message: 'The OTP has been sent to your mail',
    });
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * change aggregator password
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */

export const changePasswordAggregator = async (req, res, next) => {
  let t;
  try {
    const Res = new CustomResponse(req, res);
    t = await sequelize.transaction();
    const { aggregatorId, email, password, otp: passCode } = req.body;
    const aggregator = await Aggregator.findOne({ where: { email } });
    if (!aggregator) {
      return Res.status(400).encryptAndSend({
        error: 'no user matches the specifed email',
      });
    }

    const passwordHistories = await AggregatorPasswordHistory.findAll({
      where: { aggregatorId },
      order: [['createdAt', 'ASC']],
    });
    const { passwordHasBeenUsed } = checkAllPasswords(
      password,
      passwordHistories
    );
    if (passwordHasBeenUsed) {
      return Res.status(400).encryptAndSend({
        error:
          'This password has been used before by you. Please use a stronger password',
      });
    }

    await Otp.destroy({ where: { passCode }, transaction: t });

    await AggregatorPassword.upsert(
      { password, aggregatorId },
      { transaction: t }
    );
    await AggregatorPasswordHistory.create(
      { password, aggregatorId },
      { transaction: t }
    );

    // delete first password if passwords are more than 10
    if (passwordHistories.length > 9) {
      await passwordHistories[0].destroy();
    }

    await t.commit();

    return Res.status(200).encryptAndSend({
      message: 'Password changed successfully',
    });
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * approve an aggregator, set pending: ture
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const approveAggregator = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId: id } = req.params;
    const aggregator = await Aggregator.findOne({ where: { id } });
    if (!aggregator) {
      return Res.status(400).encryptAndSend({
        error: `no record matches the aggregator id of ${id}`,
      });
    }
    await aggregator.update({ pending: false, approvedBy: req.username });
    server.Notification.trigger('get-pending-records', 'pending-merchant');
    return Res.status(200).encryptAndSend({
      message: 'user successfully approved',
      data: aggregator,
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * approve an aggregator, set pending: ture
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const activateAggregator = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId: id } = req.params;
    const aggregator = await Aggregator.findOne({ where: { id } });
    if (!aggregator) {
      return Res.status(400).encryptAndSend({
        error: `no record matches the aggregator id of ${id}`,
      });
    }
    await aggregator.update({ isActive: true });
    return Res.status(200).encryptAndSend({
      message: 'aggregator activated',
      data: aggregator,
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * approve an aggregator, set pending: ture
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const deactivateAggregator = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId: id } = req.params;
    const aggregator = await Aggregator.findOne({ where: { id } });
    if (!aggregator) {
      return Res.status(400).encryptAndSend({
        error: `no record matches the aggregator id of ${id}`,
      });
    }
    await aggregator.update({ isActive: false });
    return Res.status(200).encryptAndSend({
      message: 'aggregator deactivated',
      data: aggregator,
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * returns all aggregators in the system
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAllAggregators = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const data = await Aggregator.findAndCountAll({
      where: {
        [Op.and]: [{ pending: false }, { isVerified: true }],
        ...filterByAccountNumber(req.query),
      },
      distinct: true,
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: AggregatorPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: AggregatorPrimaryContact, as: 'primaryContact' },
        {
          model: Merchant,
          as: 'merchants',
          include: [
            {
              model: MerchantPercentageCharge,
              as: 'percentageCharges',
              include: { model: PaymentType, as: 'paymentType' },
            },
            { model: MerchantPrimaryContact, as: 'primaryContact' },
            { model: Transaction, as: 'transactions' },
          ],
        },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * gets pending aggregators
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getPendingAggregators = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const data = await Aggregator.findAndCountAll({
      where: {
        [Op.and]: [{ pending: true }, { isVerified: true }],
        ...filterByAccountNumber(req.query),
      },
      distinct: true,
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: AggregatorPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: AggregatorPrimaryContact, as: 'primaryContact' },
        {
          model: Merchant,
          as: 'merchants',
          include: [
            {
              model: MerchantPercentageCharge,
              as: 'percentageCharges',
              include: { model: PaymentType, as: 'paymentType' },
            },
            { model: MerchantPrimaryContact, as: 'primaryContact' },
            { model: Transaction, as: 'transactions' },
          ],
        },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * gets aggregator by id
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAggregatorById = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId } = req.params;
    const data = await Aggregator.findOne({
      where: { id: aggregatorId },
      include: [
        {
          model: AggregatorPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: AggregatorPrimaryContact, as: 'primaryContact' },
        {
          model: Merchant,
          as: 'merchants',
          include: [
            {
              model: MerchantPercentageCharge,
              as: 'percentageCharges',
              include: { model: PaymentType, as: 'paymentType' },
            },
            { model: MerchantPrimaryContact, as: 'primaryContact' },
            { model: Transaction, as: 'transactions' },
          ],
        },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};
/**
 * gets basic details ligth details of an aggregator;
 * the details are only the ones required by a merchant
 * to register under an aggregator
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAggregatorBasicInfo = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId } = req.params;
    const data = await Aggregator.findOne({
      where: { id: aggregatorId },
      attributes: ['id', 'agid', 'companyName'],
    });
    if (!data) {
      return Res.status(200).encryptAndSend({
        error: 'aggregator not found; please confirm the validity of the url',
      });
    }
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get aggregator's transactions
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAggregatorTransactions = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId } = req.params;

    const data = await Transaction.findAndCountAll({
      where: {
        ...filterByTransactionStatus(req.query),
        ...filterByTransactionId(req.query),
        ...filterByDateRange(req.query),
      },
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
      include: {
        model: Merchant,
        as: 'merchant',
        where: { aggregatorId },
        include: [
          { model: SocialpayMID, as: 'socialpayMID', attributes: ['mid'] },
          { model: DirectMerchantMID, as: 'directMID', attributes: ['mid'] },
          {
            model: ExternalMerchantMID,
            as: 'externalMID',
            attributes: ['mid'],
          },
        ],
      },
    });

    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get aggregator's transaction stats
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAggregatorTransactionStats = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId } = req.params;
    const arrOfMerchantIds = (
      await Merchant.findAll({
        where: { aggregatorId },
        attributes: ['id'],
      })
    ).map(({ dataValues }) => dataValues.id);
    const totalTransactions = await Transaction.count({
      where: { merchantId: arrOfMerchantIds },
    });
    const successfulTransactions = await Transaction.count({
      where: {
        [Op.and]: [{ status: 'SUCCESSFUL' }, { merchantId: arrOfMerchantIds }],
      },
    });
    const failedTransactions = await Transaction.count({
      where: {
        [Op.and]: [{ status: 'FAILED' }, { merchantId: arrOfMerchantIds }],
      },
    });
    const pendingTransactions =
      totalTransactions - (successfulTransactions + failedTransactions);
    return Res.status(200).encryptAndSend({
      message: 'succesful',
      data: {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
      },
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get aggregator's merchants
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAggregatorMerchants = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId } = req.params;
    const data = await Merchant.findAndCountAll({
      where: {
        aggregatorId,
        isVerified: true,
        pending: false,
        ...filterByAccountNumber(req.query),
      },
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: MerchantPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get aggregator's merchants
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const updateAggregatorDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { aggregatorId: id } = req.params;
    const aggregator = await Aggregator.findOne({ where: { id } });
    await aggregator.update(req.body);
    return Res.status(200).encryptAndSend({
      message: 'update successful',
      data: aggregator,
    });
  } catch (error) {
    return next(error.message);
  }
};

export const setAggregatorPercentageCharge = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { paymentTypeId } = req.body;
    const { aggregatorId } = req.params;
    let percentageCharge = await AggregatorPercentageCharge.findOne({
      where: { aggregatorId, paymentTypeId },
    });
    if (percentageCharge) {
      percentageCharge.update(req.body);
    } else {
      percentageCharge = await AggregatorPercentageCharge.create({
        aggregatorId,
        ...req.body,
      });
    }
    return Res.status(200).encryptAndSend({
      message: 'successful',
      data: percentageCharge,
    });
  } catch (error) {
    return next(
      `Aggregator setAggregatorPercentageCharge error: ${error.message}`
    );
  }
};

export const resetAggregatorEncryptionCredentials = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'aggregator email is required' });
    }
    const aggregator = await Aggregator.findOne({
      where: { email },
      include: { model: Credential, as: 'credentials' },
    });
    if (!aggregator) {
      return Res.status(404).encryptAndSend({
        error: 'no aggregator matches the supplied email',
      });
    }
    const aggregatorCredentials = aggregator.credentials;
    const { expires, aesKey, ivKey } = req.encryptionKeys;
    await aggregatorCredentials.update({ aesKey, ivKey, expires });
    const message = `
      Your Encryption credentials are\n
      applicationId: ${aggregatorCredentials.appId}\n
      aesKey: ${aesKey}\n
      ivKey: ${ivKey}\n
      Expires on ${expires}
    `;
    const { error } = await sendEmailNotification(aggregator.email, message);
    if (error) {
      return Res.status(500).encryptAndSend({
        error: `${error.message}: failed to send notification to ${aggregator.email}. Please try again.`,
      });
    }

    return Res.status(200).encryptAndSend({
      message: 'credentials successfully reset',
    });
  } catch (error) {
    return next(
      `error while reseting aggregator's encryption credentials: ${error.message}`
    );
  }
};
