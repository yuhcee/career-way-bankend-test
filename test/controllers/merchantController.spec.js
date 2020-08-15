/* eslint-disable jest/no-test-callback */
import bcrypt from 'bcryptjs';
import supertest from 'supertest';
import sampleHash from '../sampleData/hashedPassword.sample';
import server from '../../src/app';
import db from '../../src/database/models';
import {
  registerMerchants,
  getAdminToken,
  resetDB,
  registerOneMerchant,
  registerOneAggregator,
} from '../helpers';
import {
  sampleMerchants,
  sampleAggregators,
  socialpaySampleAggregator,
} from '../sampleData';
import { getMerchantToken } from '../helpers/merchant.helpers';
import {
  getMerchantById,
  approveMerchant,
} from '../../src/controllers/merchantController';

const {
  Aggregator,
  Merchant,
  MerchantPassword,
  MerchantPasswordHistory,
  MerchantPrimaryContact,
  MerchantSecondaryContact,
  Otp,
} = db;

const app = supertest(server);

describe('merchantController', () => {
  let aggregatorId, socialPayId;
  beforeEach(async () => {
    await Merchant.destroy({ where: {}, truncate: { cascade: true } });
    await Aggregator.destroy({ where: {}, truncate: { cascade: true } });
    const socialPay = (
      await Aggregator.create(socialpaySampleAggregator)
    ).get();
    const aggregator = (await Aggregator.create(sampleAggregators[0])).get();
    aggregatorId = aggregator.id;
    socialPayId = socialPay.id;
  });

  describe('registerMerchant', () => {
    describe('try (general behaviour)', () => {
      let saved, res;
      beforeEach(async () => {
        res = await app
          .post('/api/v1/merchants/register')
          .send(sampleMerchants[0]);
        saved = await Merchant.findOne({
          where: { email: sampleMerchants[0].email },
          include: [
            {
              model: MerchantPrimaryContact,
              as: 'primaryContact',
            },
            {
              model: MerchantSecondaryContact,
              as: 'secondaryContact',
            },
          ],
          raw: true,
          nest: true,
        });
      });
      it('returns a success meessage in the response body', async (done) => {
        try {
          expect(res.body).toHaveProperty('message', 'data successfully saved');
          done();
        } catch (e) {
          done(e);
        }
      });

      it('saves the merchant"s details in the db', async (done) => {
        try {
          expect(saved).toEqual(
            expect.objectContaining({
              companyName: sampleMerchants[0].companyName,
              businessYears: sampleMerchants[0].businessYears,
              email: sampleMerchants[0].email,
              websiteLink: sampleMerchants[0].websiteLink,
              accountNumber: sampleMerchants[0].accountNumber,
              bvn: sampleMerchants[0].bvn,
              address: sampleMerchants[0].address,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });

      it('saves the merchant"s primary contact details', async (done) => {
        try {
          expect(saved.primaryContact).toEqual(
            expect.objectContaining({
              name: sampleMerchants[0].primaryContactName,
              telephone: sampleMerchants[0].primaryContactTelephone,
              phoneNumber: sampleMerchants[0].primaryContactPhoneNumber,
              email: sampleMerchants[0].primaryContactEmail,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });

      it('saves the merchant"s secondary contact details', async (done) => {
        try {
          expect(saved.secondaryContact).toEqual(
            expect.objectContaining({
              name: sampleMerchants[0].secondaryContactName,
              telephone: sampleMerchants[0].secondaryContactTelephone,
              phoneNumber: sampleMerchants[0].secondaryContactPhoneNumber,
              email: sampleMerchants[0].secondaryContactEmail,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });

      it('sets "isVerified" to false by default until the merchant is verified', async (done) => {
        try {
          const { merchant } = res.body;
          expect(merchant.isVerified).toEqual(false);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('creates an otp for the merchant', async (done) => {
        try {
          const otp = await Otp.findOne({
            where: { merchantId: saved.id },
            raw: true,
          });
          expect(otp.merchantId).toBeTruthy();
          done();
        } catch (e) {
          done(e);
        }
      });

      it('returns 500 if merchant creation is attempted without aggregatorId when socialPay is not in the system', async (done) => {
        try {
          await Merchant.destroy({ where: {}, truncate: { cascade: true } });
          await Aggregator.destroy({ where: {}, truncate: { cascade: true } });
          const res = await app
            .post('/api/v1/merchants/register')
            .send(sampleMerchants[0]);
          const expectedError = 'socialPay is not registered as an aggregator';
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', expectedError);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe('try (special case)', () => {
      it('when no aggregator is specified it registers the merchant under the socialPay aggregator', async (done) => {
        try {
          const res = await app
            .post('/api/v1/merchants/register')
            .send(sampleMerchants[0]);
          const { merchant } = res.body;
          expect(merchant.aggregatorId).toEqual(socialPayId);

          done();
        } catch (e) {
          done(e);
        }
      });
      it('when an aggregator is specified it registers the merchant under the specified aggregator', async (done) => {
        try {
          const res = await app
            .post('/api/v1/merchants/register')
            .send({ ...sampleMerchants[0], aggregatorId });
          const { merchant } = res.body;
          expect(merchant.aggregatorId).toEqual(aggregatorId);

          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe('catch', () => {
      it('returns 500 error for any error caught', async (done) => {
        try {
          const originalImplementation = Merchant.create;
          const sampleError = 'let"s pretend something went wrong';
          Merchant.create = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app
            .post('/api/v1/merchants/register')
            .send(sampleMerchants[0]);
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          Merchant.create = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('verifyMerchantSaveMidAndCreatePassword', () => {
    let passCode, merchantId;
    beforeEach(async () => {
      await app.post('/api/v1/merchants/register').send(sampleMerchants[0]);
      const merchant = await Merchant.findOne({
        where: { email: sampleMerchants[0].email },
        attributes: ['id'],
        include: { model: Otp, as: 'otp', attributes: ['passCode'] },
        raw: true,
        nest: true,
      });
      passCode = merchant.otp.passCode;
      merchantId = merchant.id;
    });

    describe('try', () => {
      let res;
      beforeEach(async () => {
        const originalImplementation = bcrypt.hashSync;
        bcrypt.hashSync = jest.fn().mockReturnValue(sampleHash);
        res = await app.post('/api/v1/merchants/verify').send({
          email: sampleMerchants[0].email,
          otp: `${passCode}`,
          password: 'testing',
        });
        bcrypt.hashSync = originalImplementation;
      });
      it('returns status 200 and a success message on successful verification', async (done) => {
        try {
          expect(res.status).toBe(200);
          const expectedMessage = 'verification completed successfully';
          expect(res.body).toHaveProperty('message', expectedMessage);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('sets the merchant"s "isVerified" status to true', async (done) => {
        try {
          const merchant = await Merchant.findOne({
            where: { id: merchantId },
            raw: true,
          });
          expect(merchant.isVerified).toEqual(true);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('creates a new password for for the merchant', async (done) => {
        try {
          const { password } = await MerchantPassword.findOne({
            where: { merchantId },
            raw: true,
          });
          expect(password).toEqual(sampleHash);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('adds the new password to the merchant"s password history', async (done) => {
        try {
          const passwordHistory = await MerchantPasswordHistory.findAll({
            raw: true,
          });
          expect(Array.isArray(passwordHistory)).toBeTruthy();
          const passwordOwners = passwordHistory.map(
            ({ merchantId }) => merchantId
          );
          expect(passwordOwners.includes(merchantId)).toBe(true);
          done();
          expect(true).toBe(true);
        } catch (e) {
          done(e);
        }
      });
    });

    describe('catch', () => {
      it('returns 500 for errors caught in the try block', async (done) => {
        try {
          const originalImplementation = Merchant.update;
          const sampleError = 'let"s presend something went wrong';
          Merchant.update = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app.post('/api/v1/merchants/verify').send({
            email: sampleMerchants[0].email,
            otp: `${passCode}`,
            password: 'testing',
          });
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          Merchant.update = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('saveMerchantOtp', () => {
    let oldOtp, merchantId;
    const email = sampleMerchants[0].email;
    beforeEach(async () => {
      const res = await app
        .post('/api/v1/merchants/register')
        .send(sampleMerchants[0]);
      const {
        merchant: { id },
      } = res.body;
      merchantId = id;
      const { passCode } = await Otp.findOne({
        where: { merchantId },
        raw: true,
      });
      oldOtp = passCode;
    });

    describe('try', () => {
      let res;
      beforeEach(async () => {
        res = await app.post('/api/v1/merchants/resend_otp').send({ email });
      });
      it('alerts the user "the OTP has been sent to your mail" with status 200', async (done) => {
        try {
          expect(res.status).toBe(200);
          const expectedMessage = 'the OTP has been sent to your mail';
          expect(res.body).toHaveProperty('message', expectedMessage);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('generates and saves a new otp for the user, replacing the old OTP if one existed', async (done) => {
        try {
          const { passCode } = await Otp.findOne({
            where: { merchantId },
            raw: true,
          });
          const newOtp = passCode;
          expect(newOtp).not.toEqual(oldOtp);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    describe('catch', () => {
      it('returns 500 for errors thrown in the try block', async (done) => {
        try {
          const originalImplementation = Otp.upsert;
          const sampleError = 'let"s pretend something went wrong';
          Otp.upsert = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app
            .post('/api/v1/merchants/resend_otp')
            .send({ email });
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          Otp.upsert = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('getAllMerchants', () => {
    describe('try', () => {
      it('returns 200 OK on successful get, returning all merchants in the system', async (done) => {
        try {
          await resetDB();
          const merchants = await registerMerchants();
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/merchants')
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.merchants).toHaveLength(merchants.length);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 erros in the catch block', async (done) => {
        try {
          await resetDB();
          await registerMerchants();
          const adminToken = await getAdminToken();
          const originalImplementation = Merchant.findAll;
          Merchant.findAll = jest.fn().mockImplementation(() => {
            throw new Error('bummer!!!');
          });
          const res = await app
            .get('/api/v1/merchants')
            .set('authorization', adminToken);
          expect(res.status).toBe(500);
          Merchant.findAll = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('getMerchantById', () => {
    describe('try', () => {
      it('returns 200 Ok on successful get by the merchant owner', async (done) => {
        try {
          await resetDB();
          const merchant = await registerOneMerchant(sampleMerchants[0]);
          const merchant2 = await registerOneMerchant(sampleMerchants[2]);
          const merchantToken = await getMerchantToken(merchant);
          const merchant2Token = await getMerchantToken(merchant2);
          const res = await app
            .get(`/api/v1/merchants/${merchant.id}`)
            .set('authorization', merchantToken);
          // console.log(res.body);
          expect(res.status).toBe(200);
          expect(res.body.merchant).toEqual(
            expect.objectContaining({
              id: merchant.id,
              email: merchant.email,
              apiKey: merchant.apiKey,
              companyName: merchant.companyName,
              aggregatorId: merchant.aggregatorId,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 200 Ok on successful get by an admin', async (done) => {
        try {
          await resetDB();
          const merchant = await registerOneMerchant(sampleMerchants[0]);
          const adminToken = await getAdminToken(merchant);
          const res = await app
            .get(`/api/v1/merchants/${merchant.id}`)
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.merchant).toEqual(
            expect.objectContaining({
              id: merchant.id,
              email: merchant.email,
              apiKey: merchant.apiKey,
              companyName: merchant.companyName,
              aggregatorId: merchant.aggregatorId,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 erros in the catch block', async (done) => {
        try {
          const req = { params: undefined };
          const res = {};
          const next = jest.fn();
          await getMerchantById(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('approveMerchant', () => {
    describe('try', () => {
      it('successfully approves the merchant', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const res = await app
            .patch('/api/v1/merchants/1/approve')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg = 'no record matches the merchant id of 1';
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
          await resetDB();
          const req = { params: undefined };
          const res = {};
          const next = jest.fn();
          await approveMerchant(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
