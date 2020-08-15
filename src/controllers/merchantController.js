import { Op } from 'sequelize';
import server from '../app';
import {
  paginate,
  getAggregatorByAgid,
  getProductType,
  filterByTransactionStatus,
  filterByTransactionId,
  filterByDateRange,
  filterByAccountNumber,
  getSocialPayAndDirectMerchantId,
  checkAllPasswords,
} from './helpers';
import { getCustomKey } from '../utils/getCustomKey';
import jwt from '../shared/security/jwt';
import db from '../database/models';
import { sendEmailNotification } from '../shared/service/messaging/mail/bankMail';
import CustomResponse from '../utils/CustomResponse';
import { checkUserStatus } from '../middlewares/helpers';
const {
  Otp,
  sequelize,
  Merchant,
  MerchantPrimaryContact,
  MerchantSecondaryContact,
  MerchantPassword,
  MerchantPasswordHistory,
  Transaction,
  DirectMerchantMID,
  SocialpayMID,
  ExternalMerchantMID,
  Aggregator,
  Credential,
  MerchantPercentageCharge,
  PaymentType,
} = db;

const { SOCIALPAY_EMAIL, ADMIN_EMAIL } = process.env;

/**
 * registers a merchant
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const registerMerchant = async (req, res, next) => {
  let t = await sequelize.transaction();
  try {
    const Res = new CustomResponse(req, res);
    const {
      otp,
      encryptionKeys,
      formattedRequest: {
        mainDetails,
        primaryContactDetails,
        secondaryContactDetails,
      },
      body: { agid },
    } = req;
    const {
      id: aggregatorId,
      email: aggregatorEmail,
    } = await getAggregatorByAgid(agid);

    const riskLevel = aggregatorEmail === SOCIALPAY_EMAIL ? null : 'high';
    const newMerchant = (
      await Merchant.create(
        { ...mainDetails, aggregatorId, riskLevel },
        {
          transaction: t,
        }
      )
    ).get();

    const { id: merchantId } = newMerchant;

    const primaryContact = await MerchantPrimaryContact.create(
      { ...primaryContactDetails, merchantId },
      { transaction: t }
    );

    const secondaryContact = await MerchantSecondaryContact.create(
      { ...secondaryContactDetails, merchantId },
      { transaction: t }
    );

    const product = getProductType(agid);
    const midRecord = await product.model.create(
      { merchantId },
      { transaction: t }
    );
    await midRecord.update(
      { mid: getCustomKey(midRecord.id, product.productKey) },
      { transaction: t }
    );

    await Otp.create({ ...otp, merchantId }, { transaction: t });
    const credentials = await Credential.create(
      {
        merchantId,
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
    sendEmailNotification(newMerchant.email, message);

    const response = Res.status(201).encryptAndSend({
      message: 'data successfully saved',
      merchant: {
        ...newMerchant,
        primaryContact,
        secondaryContact,
      },
    });

    await t.commit();

    return response;
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * registers verfies a merchant, saves mid and password
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const verifyMerchantSaveMidAndCreatePassword = async (
  req,
  res,
  next
) => {
  let t;
  try {
    const { merchantId, email, password, otp: passCode } = req.body;

    t = await sequelize.transaction();
    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return Res.status(400).encryptAndSend({
        error: 'no user matches the specifed email',
      });
    }

    const {
      socialPayId,
      directMerchantAggId,
    } = await getSocialPayAndDirectMerchantId();
    let updatePayload = {};

    if (merchant.aggregatorId === socialPayId) {
      updatePayload = { isActive: true, pending: false };
    } else if (merchant.aggregatorId === directMerchantAggId) {
      updatePayload = { isActive: true, pending: true, riskLevel: 'high' };
    } else {
      updatePayload = { isActive: false, pending: false, riskLevel: 'high' };
    }

    await merchant.update(
      { isVerified: true, ...updatePayload },
      { transaction: t }
    );
    await Otp.destroy({ where: { passCode }, transaction: t });
    await MerchantPassword.upsert({ password, merchantId }, { transaction: t });
    await MerchantPasswordHistory.create(
      { password, merchantId },
      { transaction: t }
    );

    const token = jwt.generateToken({ merchantId, role: 'merchant' });

    if (merchant.aggregatorId === directMerchantAggId) {
      const { companyName, phoneNumber, websiteLink } = merchant;

      const message = `
      Approval required for a newly created merchant:\n
      Company Name: ${companyName}\n
      Email: ${email}\n
      Phone Number: ${phoneNumber}\n
      Website Link: ${websiteLink}\n
    `;
      sendEmailNotification(ADMIN_EMAIL, message);
      server.Notification.trigger('get-pending-records', 'pending-merchant');
    }

    const Res = new CustomResponse(req, res);
    const response = Res.status(200).encryptAndSend({
      message: 'verification completed successfully',
      merchant,
      token,
    });
    await t.commit();
    return response;
  } catch (error) {
    try {
      await t.rollback();
    } catch (err) {
      return next(err.message);
    }
    return next(error.message);
  }
};

/**
 * saves merchant otp during otp/resend
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const saveMerchantOtp = async (req, res, next) => {
  try {
    const { merchantId, otp } = req;
    await Otp.upsert({ ...otp, merchantId }, { returning: true });
    const Res = new CustomResponse(req, res);
    return Res.status(200).encryptAndSend({
      message: 'the OTP has been sent to your mail',
    });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * reset merchant password
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */

export const resetMerchantPassword = async (req, res, next) => {
  let t;
  try {
    const { merchantId, otp } = req;
    t = await sequelize.transaction();
    // await
    const merchantPassword = await MerchantPassword.findOne({
      where: { merchantId },
    });

    await merchantPassword.update({ password: '' }, { transaction: t });
    await Otp.upsert({ ...otp, merchantId }, { transaction: t });

    const Res = new CustomResponse(req, res);
    const response = Res.status(200).encryptAndSend({
      message: 'The OTP has been sent to your mail',
    });

    await t.commit();

    return response;
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * change merchant password
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */

export const changePasswordMerchant = async (req, res, next) => {
  let t;
  try {
    t = await sequelize.transaction();
    const { merchantId, email, password, otp: passCode } = req.body;
    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return Res.status(400).encryptAndSend({
        error: 'no user matches the specifed email',
      });
    }

    const passwordHistories = await MerchantPasswordHistory.findAll({
      where: { merchantId },
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

    await MerchantPassword.upsert({ password, merchantId }, { transaction: t });
    await MerchantPasswordHistory.create(
      { password, merchantId },
      { transaction: t }
    );

    // delete first password if passwords are more than 10
    if (passwordHistories.length > 9) {
      await passwordHistories[0].destroy();
    }

    const Res = new CustomResponse(req, res);
    const response = Res.status(200).encryptAndSend({
      message: 'Password changed successfully',
    });
    await t.commit();

    return response;
  } catch (error) {
    await t.rollback();
    return next(error.message);
  }
};

/**
 * approves a merchant by setting pending to false;
 * also updates 'approvedBy' field with the username
 * of the  staff user that approved the record
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const approveMerchant = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: id } = req.params;
    // const { riskLevel } = req.body;
    const merchant = await Merchant.findOne({ where: { id } });
    if (merchant) {
      if (!merchant.pending) {
        return Res.status(400).encryptAndSend({
          error: 'merchant is already approved',
        });
      }
      await merchant.update({
        // riskLevel,
        pending: false,
        approvedBy: req.username,
      });
      server.Notification.trigger('stats', 'merchants');
      server.Notification.trigger('get-pending-records', 'pending-merchant');
      return Res.status(200).encryptAndSend({
        message: 'user successfully approved',
        data: merchant,
      });
    } else {
      return Res.status(400).encryptAndSend({
        error: `no record matches the merchant id of ${id}`,
      });
    }
  } catch (error) {
    return next(error.message);
  }
};

export const changeMerchantRiskLevel = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: id } = req.params;
    const { riskLevel } = req.body;
    const merchant = await Merchant.findOne({ where: { id } });

    if (!merchant) {
      return Res.status(400).encryptAndSend({
        error: 'Merchant does not exist',
      });
    }

    const { socialPayId } = await getSocialPayAndDirectMerchantId();
    if (merchant.aggregatorId === socialPayId) {
      return Res.status(400).encryptAndSend({
        error: 'Invalid request',
      });
    }
    if (merchant) {
      await merchant.update({
        riskLevel,
      });
      return Res.status(200).encryptAndSend({
        message: 'risk level successfully changed',
        data: merchant,
      });
    } else {
      return Res.status(400).encryptAndSend({
        error: `no record matches the merchant id of ${id}`,
      });
    }
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get a merchant by merchant id (not by mid)
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getAllMerchants = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const data = await Merchant.findAndCountAll({
      where: {
        [Op.and]: [{ pending: false }, { isVerified: true }],
        ...filterByAccountNumber(req.query),
      },
      distinct: true,
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: MerchantPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: MerchantPrimaryContact, as: 'primaryContact' },
        { model: Transaction, as: 'transactions' },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

export const getPendingMerchants = async (req, res, next) => {
  const Res = new CustomResponse(req, res);
  try {
    const data = await Merchant.findAndCountAll({
      where: {
        [Op.and]: [{ pending: true }, { isVerified: true }],
        ...filterByAccountNumber(req.query),
      },
      distinct: true,
      ...paginate(req.query),
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: MerchantPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: MerchantPrimaryContact, as: 'primaryContact' },
        { model: Transaction, as: 'transactions' },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get a merchant by merchant id (not by mid)
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getMerchantById = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId } = req.params;
    const data = await Merchant.findOne({
      where: { id: merchantId },
      include: [
        {
          model: MerchantPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: MerchantPrimaryContact, as: 'primaryContact' },
        { model: Transaction, as: 'transactions' },
      ],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

export const getMerchantByApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.params;
    const merchant = await Merchant.findOne({
      where: { apiKey },
      include: [
        {
          model: MerchantPercentageCharge,
          as: 'percentageCharges',
          include: { model: PaymentType, as: 'paymentType' },
        },
        { model: Aggregator, as: 'aggregator' },
        { model: DirectMerchantMID, as: 'directMID' },
        { model: SocialpayMID, as: 'socialpayMID' },
        { model: ExternalMerchantMID, as: 'externalMID' },
      ],
    });
    if (!merchant) {
      return res.status(404).json({
        error: 'Merchant record not found',
      });
    }
    const {
      socialpayMID,
      directMID,
      externalMID,
      aggregator,
      ...merchantInfo
    } = merchant.dataValues;
    if (
      merchant.pending ||
      !merchant.isActive ||
      !merchant.isVerified ||
      !aggregator ||
      !aggregator.isActive
    ) {
      return res.status(404).json({
        error: 'Merchant cannot proceed with this transaction',
      });
    }
    const mid =
      (socialpayMID && socialpayMID.mid) ||
      (directMID && directMID.mid) ||
      (externalMID && externalMID.mid);
    const { agid } = aggregator;
    return res.status(200).json({
      message: 'successful',
      data: { ...merchantInfo, mid, agid },
    });
  } catch (error) {
    return next(`getMerchantByApiKey: ${error.message}`);
  }
};

/**
 * get a merchant's transactions
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getMerchantTransactions = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId } = req.params;
    const data = await Transaction.findAndCountAll({
      where: {
        merchantId,
        ...filterByTransactionStatus(req.query),
        ...filterByTransactionId(req.query),
        ...filterByDateRange(req.query),
      },
      ...paginate(req.query),
      order: [['createdAt', 'DESC']],
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

/**
 * get a merchant's transactions stats
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {object}
 */
export const getMerchantTransactionStats = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId } = req.params;
    const totalTransactions = await Transaction.count({
      where: { merchantId },
    });
    const successfulTransactions = await Transaction.count({
      where: {
        [Op.and]: [{ merchantId }, { status: 'SUCCESSFUL' }],
      },
    });
    const failedTransactions = await Transaction.count({
      where: {
        [Op.and]: [{ merchantId }, { status: 'FAILED' }],
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

export const activateMerchant = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: id } = req.params;
    const merchant = await Merchant.findOne({ where: { id } });
    await merchant.update({ isActive: true });
    return Res.status(200).encryptAndSend({
      message: 'merchant activated successfully',
      data: merchant,
    });
  } catch (error) {
    return next(error.message);
  }
};
export const deactivateMerchant = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: id } = req.params;
    const merchant = await Merchant.findOne({ where: { id } });
    await merchant.update({ isActive: false });
    return Res.status(200).encryptAndSend({
      message: 'merchant deactivated successfully',
      data: merchant,
    });
  } catch (error) {
    return next(error.message);
  }
};

export const updateMerchantDetails = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId: id } = req.params;
    const merchant = await Merchant.findOne({ where: { id } });
    await merchant.update(req.body);
    return Res.status(200).encryptAndSend({
      message: 'update successful',
      data: merchant,
    });
  } catch (error) {
    return next(error.message);
  }
};

export const setMerchantPercentageCharge = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { paymentTypeId } = req.body;
    const { merchantId } = req.params;
    let percentageCharge = await MerchantPercentageCharge.findOne({
      where: { merchantId, paymentTypeId },
    });
    if (percentageCharge) {
      percentageCharge.update(req.body);
    } else {
      percentageCharge = await MerchantPercentageCharge.create({
        merchantId,
        ...req.body,
      });
    }
    return Res.status(200).encryptAndSend({
      message: 'successful',
      data: percentageCharge,
    });
  } catch (error) {
    return next(
      `Aggregator setMerchantPercentageCharge error: ${error.message}`
    );
  }
};

export const changeMerchantAggregator = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { merchantId } = req.params;
    const { agid } = req.body;
    const merchant = await Merchant.findOne({ where: { id: merchantId } });
    const aggregator = await Aggregator.findOne({ where: { agid } }).catch(
      // eslint-disable-next-line no-unused-vars
      (err) => null
    );
    // console.log({ agid, aggregator });
    if (!merchant) {
      return Res.status(404).encryptAndSend({
        error: `no merchant matches the id of ${merchantId}`,
      });
    }
    if (!aggregator) {
      return Res.status(404).encryptAndSend({
        error: 'aggregator not found. Ensure you have provided a valid agid',
      });
    }
    const error = checkUserStatus(
      aggregator,
      'the specified aggrator"s account'
    );
    if (error) return Res.status(400).encryptAndSend({ error });
    await merchant.update({ aggregatorId: aggregator.id });
    return Res.status(200).encryptAndSend({ data: merchant });
  } catch (error) {
    return next(`changeMerchantAgid Error: ${error.message}`);
  }
};

export const resetMerchantEncryptionCredentials = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'merchant email is required' });
    }
    const merchant = await Merchant.findOne({
      where: { email },
      include: { model: Credential, as: 'credentials' },
    });
    if (!merchant) {
      return Res.status(404).encryptAndSend({
        error: 'no merchant matches the supplied email',
      });
    }
    const merchantCredentials = merchant.credentials;
    const { expires, aesKey, ivKey } = req.encryptionKeys;
    await merchantCredentials.update({ aesKey, ivKey, expires });
    const message = `
      Your Encryption credentials are\n
      applicationId: ${merchantCredentials.appId}\n
      aesKey: ${aesKey}\n
      ivKey: ${ivKey}\n
      Expires on ${expires}
    `;
    const { error } = await sendEmailNotification(merchant.email, message);
    if (error) {
      return Res.status(500).encryptAndSend({
        error: `${error.message}: failed to send notification to ${merchant.email}. Please try again.`,
      });
    }

    return Res.status(200).encryptAndSend({
      message: 'credentials successfully reset',
    });
  } catch (error) {
    return next(
      `error while reseting merchant's encryption credentials: ${error.message}`
    );
  }
};
