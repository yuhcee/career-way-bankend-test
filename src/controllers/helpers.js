/* eslint-disable indent */
import { Op } from 'sequelize';
import db from '../database/models';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

const { Aggregator, SocialpayMID, DirectMerchantMID, ExternalMerchantMID } = db;

export const tryRollback = async (t) => {
  try {
    await t.rollback();
  } catch (error) {
    return error.message;
  }
};

export const paginate = ({ page, pageSize }) => ({
  offset: Number(page * pageSize) || 0,
  limit: Number(pageSize) || 0,
});

export const filterByTransactionStatus = ({ status }) => {
  return status ? { status } : {};
};

export const filterByTransactionId = ({ transactionId }) => {
  return transactionId
    ? { transactionId: { [Op.like]: `%${transactionId}%` } }
    : {};
};

export const filterByAccountNumber = ({ accountNumber }) => {
  return accountNumber
    ? { accountNumber: { [Op.like]: `%${accountNumber}%` } }
    : {};
};

/**
 * expects a valid date in the fromat (YYYY-MM-DD); returns data with
 * createdAt range starting from 'fromDate' up to, but not including 'toDate'
 * The value 8640000000000000 is the maximum timestamp and new Date(8640000000000000)
 * gives the maximum time in the future --- infinity future
 * @param {from} param0 the starting date
 * @param {to} param1 the ending date
 */
// export const filterByDateRange = ({
//   from = '1970-01-01T00:00:00.000Z',
//   to = '+275760-09-11T23:59:59.999Z',
// }) => {
//   const fromDate = new Date(from);
//   let toDate = new Date(to);
//   toDate = new Date(toDate.setDate(toDate.getDate() + 1));

//   return {
//     createdAt: {
//       [Op.between]: [fromDate, toDate],
//     },
//   };
// };
export const filterByDateRange = ({ from, to }) => {
  if (!from || !to) {
    return {};
  }
  const fromDate = new Date(from);
  let toDate = new Date(to);
  toDate = new Date(toDate.setDate(toDate.getDate() + 1));

  return {
    createdAt: {
      [Op.between]: [fromDate, toDate],
    },
  };
};

export const groupby = (sequelize, { groupby }) => {
  switch (groupby) {
    case 'status':
      return {
        attributes: [
          [sequelize.literal('status'), 'status'],
          [sequelize.literal('COUNT(*)'), 'count'],
        ],
        group: ['status'],
      };
    case 'month':
      return {
        group: [
          [
            sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')),
            'month',
          ],
        ],
        attributes: [
          [
            sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')),
            'monthDate',
          ],
          [sequelize.fn('COUNT', 'month'), 'count'],
        ],
      };
    default:
      return {
        attributes: [
          [sequelize.literal('id'), 'id'],
          [sequelize.literal('COUNT(*)'), 'count'],
        ],
        group: ['id'],
      };
  }
};

export const getAggregatorByAgid = async (agid) => {
  const aggregator = await Aggregator.findOne({
    where: { agid },
    raw: true,
  });
  if (!aggregator) {
    throw new Error(`no aggregator matches the agid ${agid}`);
  }
  return aggregator;
};

export const getAggregatorByEmail = async (email) => {
  const aggregator = await Aggregator.findOne({
    where: { email },
    raw: true,
  });
  if (!aggregator) {
    throw new Error(`no aggregator matches the email ${email}`);
  }
  return aggregator;
};

export const getProductType = (agid) => {
  const productDictionary = {
    accessng0000001: { model: SocialpayMID, productKey: 'ACCESSSP' },
    accessng0000002: { model: DirectMerchantMID, productKey: 'ACCESSDM' },
  };

  return (
    productDictionary[agid] || {
      model: ExternalMerchantMID,
      productKey: 'ACCESSAM',
    }
  );
};

export const groupbyMonth = (sequelize) => {
  return {
    group: [
      process.env.DB_DIALECT === 'mysql'
        ? [
            sequelize.fn(
              'date_format',
              sequelize.col('Transaction.createdAt'),
              '%Y-%m-01'
            ),
            'month',
          ]
        : [
            sequelize.fn(
              'date_trunc',
              'month',
              sequelize.col('Transaction.createdAt')
            ),
            'month',
          ],
      'merchant.id',
    ],
    attributes: [
      process.env.DB_DIALECT === 'mysql'
        ? [
            sequelize.fn(
              'date_format',
              sequelize.col('Transaction.createdAt'),
              '%Y-%m-01'
            ),
            'monthDate',
          ]
        : [
            sequelize.fn(
              'date_trunc',
              'month',
              sequelize.col('Transaction.createdAt')
            ),
            'monthDate',
          ],
      [sequelize.fn('COUNT', 'month'), 'count'],
    ],
  };
};

// export const groupbyMonth = (sequelize) => {
//   return {
//     group: [
//       [
//         sequelize.fn(
//           'date_trunc',
//           'month',
//           sequelize.col('Transaction.createdAt')
//         ),
//         'month',
//       ],
//       'merchant.id',
//     ],
//     attributes: [
//       [
//         sequelize.fn(
//           'date_trunc',
//           'month',
//           sequelize.col('Transaction.createdAt')
//         ),
//         'monthDate',
//       ],
//       [sequelize.fn('COUNT', 'month'), 'count'],
//     ],
//   };
// };

export const getSocialPayAndDirectMerchantId = async () => {
  try {
    const {DIRECTMERCHANT_EMAIL, SOCIALPAY_EMAIL} = process.env;
    const { id: socialPayId } = await getAggregatorByEmail(SOCIALPAY_EMAIL);
    const { id: directMerchantAggId } = await getAggregatorByEmail(
      DIRECTMERCHANT_EMAIL
    );
    return { socialPayId, directMerchantAggId };
  } catch (error) {
    return {};
  }
};

export const checkAllPasswords = (currentPassword, oldPasswords) => {
  if (!oldPasswords || !oldPasswords.length) {
    return { passwordHasBeenUsed: false };
  }

  for (let i = 0; i < oldPasswords.length; i++) {
    const { dataValues } = oldPasswords[i];
    const isCorrectPassword = bcrypt.compareSync(
      currentPassword,
      dataValues.password || '#'
    );
    if (isCorrectPassword) {
      return { passwordHasBeenUsed: true };
    }
  }

  return { passwordHasBeenUsed: false };
};
