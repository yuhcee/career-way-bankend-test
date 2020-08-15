/* eslint-disable jest/no-test-callback */
import supertest from 'supertest';
import Joi from '@hapi/joi';
import server from '../../src/app';
import { getAdminToken, resetDB } from '../helpers';

const app = supertest(server);

describe('transactionMiddleware', () => {
  describe('validateQueryInfindAll', () => {
    describe('try', () => {
      it('returns 400 if "page" value is not integer', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const pageSize = 2.5;
          const res = await app
            .get(`/api/v1/transactions?page=1&pageSize=${pageSize}`)
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty(
            'error',
            '"pageSize" must be an integer'
          );
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 400 if "pageSize" value is not integer', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const page = 2.5;
          const res = await app
            .get(`/api/v1/transactions?page=${page}&pageSize=2`)
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty('error', '"page" must be an integer');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 400 if status is not one of PENDING, SUCCESSFUL, or FAILED', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions?status=COMPLETED')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg =
            '"status" must be one of [PENDING, SUCCESSFUL, FAILED]';
          expect(res.body).toHaveProperty('error', errorMsg);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 400 if any unknown query is specified', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions?statusXXXX=COMPLETED')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg = '"statusXXXX" is not allowed';
          expect(res.body).toHaveProperty('error', errorMsg);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const originalImplementation = Joi.object;
          Joi.object = jest.fn().mockImplementation(() => {
            throw new Error('bummer!!!');
          });
          const res = await app
            .get('/api/v1/transactions?status=COMPLETED')
            .set('authorization', adminToken);
          Joi.object = originalImplementation;
          expect(res.status).toBe(500);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('validateGroupbyQuery', () => {
    describe('try', () => {
      it('returns 400 if the groupby query is not one of "status" or "month"', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions/count?groupby=not_status_or_month')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg = '"groupby" must be one of [status, month]';
          expect(res.body).toHaveProperty('error', errorMsg);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 400 if unknown query is specified', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/transactions/count?groupby=status&&XXXX=YYYY')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg = '"XXXX" is not allowed';
          expect(res.body).toHaveProperty('error', errorMsg);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const adminToken = await getAdminToken();
          const originalImplementation = Joi.object;
          Joi.object = jest.fn().mockImplementation(() => {
            throw new Error('bummer!!!');
          });
          const res = await app
            .get('/api/v1/transactions/count?groupby=status')
            .set('authorization', adminToken);
          Joi.object = originalImplementation;
          expect(res.status).toBe(500);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
