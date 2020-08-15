/* eslint-disable jest/no-test-callback */
import axios from 'axios';
import supertest from 'supertest';
import server from '../../src/app';
import {
  resetDB,
  registerOneAggregator,
  registerOneMerchant,
} from '../helpers';
import { MERCHANT_PASSWORD, AGGREGATOR_PASSWORD } from '../sampleData';
import {
  loginAdmin,
  loginMerchant,
  loginAggregator,
} from '../../src/controllers/authController';

const app = supertest(server);

describe('authController', () => {
  describe('loginAggregator', () => {
    describe('try', () => {
      it('returns 200 OK on successful login', async (done) => {
        try {
          await resetDB();
          const aggregator = await registerOneAggregator();
          const res = await app.post('/api/v1/aggregators/login').send({
            email: aggregator.email,
            password: AGGREGATOR_PASSWORD,
          });
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('token');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 401 when the email does not match any aggregator in the system', async (done) => {
        try {
          await resetDB();
          const res = await app.post('/api/v1/aggregators/login').send({
            email: 'incorrect@gmail.com',
            password: AGGREGATOR_PASSWORD,
          });
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error', 'invalid credentials');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 401 if email exists but the password is incorrect', async (done) => {
        try {
          await resetDB();
          const aggregator = await registerOneAggregator();
          const res = await app.post('/api/v1/aggregators/login').send({
            email: aggregator.email,
            password: 'incorrect_password',
          });
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error', 'invalid credentials');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const req = { body: undefined };
          const res = { body: {} };
          const next = jest.fn();
          await loginAggregator(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('loginMerchant', () => {
    describe('try', () => {
      it('returns 200 OK on successful login', async (done) => {
        try {
          await resetDB();
          const merchant = await registerOneMerchant();
          const res = await app.post('/api/v1/merchants/login').send({
            email: merchant.email,
            password: MERCHANT_PASSWORD,
          });
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('message', 'login successful');
          expect(res.body).toHaveProperty('token');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 401 when the email does not match any merchant in the system', async (done) => {
        try {
          await resetDB();
          await registerOneMerchant();
          const res = await app.post('/api/v1/merchants/login').send({
            email: 'incorrect@gmail.com',
            password: MERCHANT_PASSWORD,
          });
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error', 'invalid credentials');
          done();
        } catch (e) {
          done(e);
        }
      });

      it('returns 401 if the email exists but the password is incorrect', async (done) => {
        try {
          await resetDB();
          const merchant = await registerOneMerchant();
          const res = await app.post('/api/v1/merchants/login').send({
            email: merchant.email,
            password: 'incorrect_password',
          });
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty('error', 'invalid credentials');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const req = { body: undefined };
          const res = { body: {} };
          const next = jest.fn();
          await loginMerchant(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('loginAdmin', () => {
    describe('try', () => {
      it('returns 200 OK on successful login', async (done) => {
        try {
          await resetDB();
          const originalImplementation = axios.post;
          axios.post = jest.fn().mockReturnValue({ data: { userExist: true } });
          const res = await app.post('/api/v1/admin/login').send({
            username: 'correct_NT_username',
            password: 'correct_NT_password',
          });
          axios.post = originalImplementation;
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('message', 'login successful');
          expect(res.body).toHaveProperty('token');
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 401 for invaid username/password', async (done) => {
        try {
          await resetDB();
          const originalImplementation = axios.post;
          axios.post = jest
            .fn()
            .mockReturnValue({ data: { userExist: false } });
          const res = await app.post('/api/v1/admin/login').send({
            username: 'incorrect_NT_username',
            password: 'incorrect_NT_password',
          });
          axios.post = originalImplementation;
          expect(res.status).toBe(401);
          expect(res.body).toHaveProperty(
            'error',
            'invalid username and/or password'
          );
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const req = { body: undefined };
          const res = { body: {} };
          const next = jest.fn();
          await loginAdmin(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
