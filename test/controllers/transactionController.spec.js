/* eslint-disable jest/no-test-callback */
import supertest from 'supertest';
import db from '../../src/database/models';
import server from '../../src/app';
import { sampleMerchants } from '../sampleData/merchants.sample';
import {
  registerOneMerchant,
  createTransactions,
  getAdminToken,
  resetDB,
} from '../helpers';
import {
  getAllTransactions,
  getCountByStatus,
} from '../../src/controllers/transactionController';

const { Transaction } = db;

const app = supertest(server);

describe('transactionController', () => {
  beforeEach(async () => {
    await resetDB();
    const merchant = await registerOneMerchant();
    const merchant2 = await registerOneMerchant(sampleMerchants[1]);
    await createTransactions({
      merchant,
      count: 2,
    });
    await createTransactions({
      merchant,
      count: 1,
      type: 'VERVE',
      status: 'FAILED',
    });
    await createTransactions({
      merchant: merchant2,
      count: 2,
      type: 'MASTERCARD',
      status: 'SUCCESSFUL',
    });
  });
  describe('getAllTransactions', () => {
    describe('try', () => {
      it('returns all transactions if requester is admin', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions')
            .set('authorization', adminToken);
          const totalTransactionsInDB = await Transaction.count();
          expect(res.status).toBe(200);
          expect(res.body.transactions).toHaveLength(totalTransactionsInDB);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns the paginated data if "page" and "pageSize" are specifed', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const pageSize = 2;
          const res = await app
            .get(`/api/v1/transactions?page=1&pageSize=${pageSize}`)
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.transactions).toHaveLength(pageSize);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns only "PENDING" transactions if filtered by status=PENDING', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const {
            body: { transactions },
          } = await app
            .get('/api/v1/transactions?status=PENDING')
            .set('authorization', adminToken);
          const nonPendingTransactions = transactions.filter(
            (trx) => trx.status !== 'PENDING'
          );
          expect(nonPendingTransactions).toHaveLength(0);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns only "SUCCESSFUL" transactions if filtered by status=SUCCESSFUL', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const {
            body: { transactions },
          } = await app
            .get('/api/v1/transactions?status=SUCCESSFUL')
            .set('authorization', adminToken);
          const nonSuccessfulTransactions = transactions.filter(
            (trx) => trx.status !== 'SUCCESSFUL'
          );
          expect(nonSuccessfulTransactions).toHaveLength(0);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns only "FAILED" transactions if filtered by status=FAILED', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const {
            body: { transactions },
          } = await app
            .get('/api/v1/transactions?status=FAILED')
            .set('authorization', adminToken);
          const nonFailedTransactions = transactions.filter(
            (trx) => trx.status !== 'FAILED'
          );
          expect(nonFailedTransactions).toHaveLength(0);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const req = { query: undefined };
          const res = { body: { transactions: [] } };
          const next = jest.fn();
          getAllTransactions(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('getCountByStatus', () => {
    describe('try', () => {
      it('returns the count grouped by status', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const pendingTrxs = await Transaction.findAll({
            where: { status: 'PENDING' },
          });
          const successfulTrxs = await Transaction.findAll({
            where: { status: 'SUCCESSFUL' },
          });
          const failedTrxs = await Transaction.findAll({
            where: { status: 'FAILED' },
          });
          const {
            body: { transactions },
          } = await app
            .get('/api/v1/transactions/count?groupby=status')
            .set('authorization', adminToken);
          const pending = transactions.find((trx) => trx.status === 'PENDING');
          const successful = transactions.find(
            (trx) => trx.status === 'SUCCESSFUL'
          );
          const failed = transactions.find((trx) => trx.status === 'FAILED');
          expect(pendingTrxs).toHaveLength(Number(pending.count));
          expect(successfulTrxs).toHaveLength(Number(successful.count));
          expect(failedTrxs).toHaveLength(Number(failed.count));
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns the count grouped by month of creation', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions/count?groupby=month')
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const req = { query: undefined };
          const res = { body: { transactions: [] } };
          const next = jest.fn();
          getCountByStatus(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
