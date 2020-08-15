/* eslint-disable indent */
import db from '../../src/database/models';
import { v4 as uuidv4 } from 'uuid';
const { Transaction } = db;

export const createTransactions = async ({
  count,
  type = 'VISA',
  status = 'PENDING',
  merchant,
}) => {
  const transactions = [];
  for (let i = 0; i < count; i++) {
    const transaction = {
      merchantId: merchant.id,
      mid: merchant.mid,
      transactionId: uuidv4(),
      type,
      status,
      amount: 10000.0,
      cardHolder: 'Jon Snow',
      ip: '10.1.7.227',
    };

    (transaction.reconciliationId =
      transaction.status !== 'PENDING'
        ? `R${transaction.transactionId}`
        : null),
      transactions.push(transaction);
  }

  const result = await Transaction.bulkCreate(transactions);
  return result.map(({ dataValues }) => dataValues);
};
