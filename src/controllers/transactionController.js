import { Op } from 'sequelize';
import db from '../database/models';
import {
  paginate,
  groupby,
  filterByTransactionStatus,
  filterByTransactionId,
  filterByDateRange,
} from './helpers';
import CustomResponse from '../utils/CustomResponse';
import server from '../app';

const {
  sequelize,
  Aggregator,
  Merchant,
  SocialpayMID,
  ExternalMerchantMID,
  DirectMerchantMID,
  Transaction,
} = db;

export const createTransaction = async (req, res, next) => {
  // const Res = new CustomResponse(req, res);
  try {
    server.Notification.trigger('stats', 'transactions');
    const newTransaction = await Transaction.create(req.body);

    return res.status(201).json({
      message: 'transaction successfully created',
      newTransaction,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return next(error.message);
  }
};

export const getAllTransactions = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
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
        where: {},
        include: [
          { model: SocialpayMID, as: 'socialpayMID', attributes: ['mid'] },
          { model: DirectMerchantMID, as: 'directMID', attributes: ['mid'] },
          {
            model: ExternalMerchantMID,
            as: 'externalMID',
            attributes: ['mid'],
          },
          {
            model: Aggregator,
            as: 'aggregator',
          },
        ],
      },
    });
    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    // const Res = new CustomResponse(req, res);
    const id = req.params.transactionId.trim();
    const data = await Transaction.findOne({
      where: {
        [Op.or]: [{ transactionId: id }, { reconciliationId: id }],
      },
    });
    if (!data) {
      return res.status(404).json({
        error: 'Transaction record not found',
      });
    }
    return res.status(200).json({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

export const updateTransactionById = async (req, res, next) => {
  try {
    // const Res = new CustomResponse(req, res);
    const id = req.params.transactionId.trim();
    const { status, reconciliationId } = req.body;
    const data = await Transaction.findOne({
      where: {
        transactionId: id,
      },
    });
    if (!data) {
      return res.status(404).json({
        error: 'Transaction record not found',
      });
    }
    if (data.status !== 'PENDING' || data.reconciliationId) {
      return res.status(422).json({
        error: 'Transaction has already been updated. No updates were made.',
      });
    }
    await data.update({
      status,
      reconciliationId,
    });
    return res.status(200).json({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

export const getCountByStatus = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const data = await Transaction.findAll({
      ...groupby(sequelize, req.query),
    });
    return Res.status(200).encryptAndSend({ data });
  } catch (error) {
    return next(error.message);
  }
};

export const getExternalAggregatorTransactions = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
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
        where: {},
        include: [
          { model: SocialpayMID, as: 'socialpayMID', attributes: ['mid'] },
          { model: DirectMerchantMID, as: 'directMID', attributes: ['mid'] },
          {
            model: ExternalMerchantMID,
            as: 'externalMID',
            attributes: ['mid'],
          },
          {
            model: Aggregator,
            as: 'aggregator',
            where: {
              email: {
                [Op.notIn]: [
                  process.env.SOCIALPAY_EMAIL,
                  process.env.DIRECTMERCHANT_EMAIL,
                ],
              },
            },
          },
        ],
      },
    });

    return Res.status(200).encryptAndSend({ message: 'successful', data });
  } catch (error) {
    return next(error.message);
  }
};

const getTrxCountByStatus = async (status) => {
  const condition = status ? { status } : {};
  const count = await Transaction.count({
    where: { ...condition },
    include: {
      model: Merchant,
      as: 'merchant',
      attributes: ['id'],
      where: {},
      include: {
        model: Aggregator,
        as: 'aggregator',
        where: {
          email: {
            [Op.notIn]: [
              process.env.SOCIALPAY_EMAIL,
              process.env.DIRECTMERCHANT_EMAIL,
            ],
          },
        },
      },
    },
  });
  return count;
};

export const getExternalAggregatorTransactionStats = async (req, res, next) => {
  try {
    const Res = new CustomResponse(req, res);
    const totalTransactions = await getTrxCountByStatus();
    const failedTransactions = await getTrxCountByStatus('FAILED');
    const successfulTransactions = await getTrxCountByStatus('SUCCESSFUL');
    const pendingTransactions =
      totalTransactions - (successfulTransactions + failedTransactions);

    return Res.status(200).encryptAndSend({
      message: 'successful',
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
