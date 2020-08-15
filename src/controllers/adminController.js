import db, { sequelize } from '../database/models';
import { groupbyMonth } from './helpers';
import { Op } from 'sequelize';
import CustomResponse from '../utils/CustomResponse';
const { Transaction, Aggregator, Merchant } = db;

export const getAdminDashboardData = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const data = {};
    const totalMerchants = await Merchant.count({
      where: { [Op.and]: [{ pending: false }, { isVerified: true }] },
    });
    const socialpayMerchants = await Merchant.count({
      where: { [Op.and]: [{ pending: false }, { isVerified: true }] },
      include: {
        model: Aggregator,
        as: 'aggregator',
        where: { email: process.env.SOCIALPAY_EMAIL },
      },
    });

    const directMerchants = await Merchant.count({
      where: { [Op.and]: [{ pending: false }, { isVerified: true }] },
      include: {
        model: Aggregator,
        as: 'aggregator',
        where: { email: process.env.DIRECTMERCHANT_EMAIL },
      },
    });
    const externalMerchants =
      totalMerchants - (socialpayMerchants + directMerchants);

    data.merchantCount = {
      totalMerchants,
      socialpayMerchants,
      directMerchants,
      externalMerchants,
    };

    const totalTransactions = await Transaction.count();
    const successfulTransactions = await Transaction.count({
      where: { status: 'SUCCESSFUL' },
    });
    const failedTransactions = await Transaction.count({
      where: { status: 'FAILED' },
    });
    const pendingTransactions =
      totalTransactions - (successfulTransactions + failedTransactions);
    data.transactionCount = {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
    };

    const socialpay = await Aggregator.findOne({
      where: { email: process.env.SOCIALPAY_EMAIL },
      attributes: ['id'],
    });

    if (!socialpay) {
      return Res.status(400).encryptAndSend({
        error: 'could not find socialpay aggregator in the system',
      });
    }
    const directMerchantAgg = await Aggregator.findOne({
      where: { email: process.env.DIRECTMERCHANT_EMAIL },
      attributes: ['id'],
    });

    if (!directMerchantAgg) {
      return Res.status(400).encryptAndSend({
        error: 'could not find direct merchant aggregator in the system',
      });
    }

    const socialpayMerchantsMonthlyTransactions = await Transaction.findAll({
      include: {
        model: Merchant,
        as: 'merchant',
        attributes: ['id'],
        where: { aggregatorId: socialpay.id },
      },
      exclude: ['merchant'],
      ...groupbyMonth(sequelize),
    });

    const directMerchantsMonthlyTransactions = await Transaction.findAll({
      include: {
        model: Merchant,
        as: 'merchant',
        attributes: ['id'],
        where: { aggregatorId: directMerchantAgg.id },
      },
      exclude: ['merchant'],
      ...groupbyMonth(sequelize),
    });
    const externalAggMonthlyTransactions = await Transaction.findAll({
      include: {
        model: Merchant,
        as: 'merchant',
        attributes: ['id'],
        where: {
          aggregatorId: { [Op.notIn]: [socialpay.id, directMerchantAgg.id] },
        },
      },
      exclude: ['merchant'],
      ...groupbyMonth(sequelize),
    });
    data.socialpayMerchantsMonthlyTransactions = socialpayMerchantsMonthlyTransactions;
    data.directMerchantsMonthlyTransactions = directMerchantsMonthlyTransactions;
    data.externalAggMonthlyTransactions = externalAggMonthlyTransactions;
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    // console.log(error);
    return next(error.message);
  }
};

export const getTotalPendingUsers = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const pendingMerchants = await Merchant.count({
      where: { [Op.and]: [{ pending: true }, { isVerified: true }] },
    });
    const pendingAggregators = await Aggregator.count({
      where: { [Op.and]: [{ pending: true }, { isVerified: true }] },
    });
    const total = pendingMerchants + pendingAggregators;
    return Res.status(200).encryptAndSend({
      message: 'successful',
      data: { count: total },
    });
  } catch (error) {
    return next(error.message);
  }
};
