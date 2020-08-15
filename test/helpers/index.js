import db from '../../src/database/models';
import {
  registerAggregators,
  registerOneAggregator,
} from './aggregator.helpers';
import { registerMerchants, registerOneMerchant } from './merchant.helpers';
import { createTransactions } from './transactins.helpers';
import { getAdminToken } from './admin.helpers';
const { Aggregator, Merchant, Otp, Transaction } = db;

export const resetDB = async () => {
  await Transaction.destroy({ where: {}, truncate: { cascade: true } });
  await Otp.destroy({ where: {}, truncate: { cascade: true } });
  await Merchant.destroy({ where: {}, truncate: { cascade: true } });
  await Aggregator.destroy({ where: {}, truncate: { cascade: true } });
};
export {
  registerAggregators,
  registerOneAggregator,
  registerMerchants,
  registerOneMerchant,
  getAdminToken,
  createTransactions,
};
