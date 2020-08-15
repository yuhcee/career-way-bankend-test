/* eslint-disable jest/no-test-callback */
/* eslint-disable quotes */
import bcrypt from 'bcryptjs';
import supertest from 'supertest';
import sampleHash from '../sampleData/hashedPassword.sample';
import server from '../../src/app';
import db from '../../src/database/models';
import { sampleAggregators } from '../sampleData';
import {
  getAggregatorById,
  approveAggregator,
} from '../../src/controllers/aggregatorController';
import {
  registerOneAggregator,
  registerAggregators,
  getAdminToken,
  resetDB,
} from '../helpers';

const {
  Aggregator,
  AggregatorPassword,
  AggregatorPasswordHistory,
  AggregatorPrimaryContact,
  AggregatorSecondaryContact,
  Merchant,
  Otp,
} = db;

const app = supertest(server);

describe('aggregatorController', () => {
  beforeEach(async () => {
    await Merchant.destroy({ where: {}, truncate: { cascade: true } });
    await Aggregator.destroy({ where: {}, truncate: { cascade: true } });
  });
  describe('registerAggregator', () => {
    describe('try', () => {
      it('successfully saves and returns aggregator details', async (done) => {
        try {
          const res = await app
            .post('/api/v1/aggregators/register')
            .send(sampleAggregators[0]);
          const savedAggregator = await Aggregator.findOne({
            where: { email: sampleAggregators[0].email },
            include: [
              {
                model: AggregatorPrimaryContact,
                as: 'primaryContact',
              },
              {
                model: AggregatorSecondaryContact,
                as: 'secondaryContact',
              },
            ],
            raw: true,
            nest: true,
          });
          const sent = sampleAggregators[0];
          const saved = savedAggregator;
          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty('message', 'data successfully saved');
          expect(sent.companyName).toEqual(saved.companyName);
          expect(sent.businessYears).toEqual(saved.businessYears);
          expect(sent.phoneNumber).toEqual(saved.phoneNumber);
          expect(sent.email).toEqual(saved.email);
          expect(sent.websiteLink).toEqual(saved.websiteLink);
          expect(sent.accountNumber).toEqual(saved.accountNumber);
          expect(sent.bvn).toEqual(saved.bvn);
          expect(sent.percentage).toEqual(saved.percentage);
          expect(sent.primaryContactName).toEqual(saved.primaryContact.name);
          expect(sent.primaryContactTelephone).toEqual(
            saved.primaryContact.telephone
          );
          expect(sent.primaryContactPhoneNumber).toEqual(
            saved.primaryContact.phoneNumber
          );
          expect(sent.primaryContactEmail).toEqual(saved.primaryContact.email);
          expect(sent.secondaryContactName).toEqual(
            saved.secondaryContact.name
          );
          expect(sent.secondaryContactTelephone).toEqual(
            saved.secondaryContact.telephone
          );
          expect(sent.secondaryContactPhoneNumber).toEqual(
            saved.secondaryContact.phoneNumber
          );
          expect(sent.secondaryContactEmail).toEqual(
            saved.secondaryContact.email
          );

          done();
        } catch (e) {
          done(e);
        }
      });
      it("sets the 'isVerified' to false by default", async (done) => {
        try {
          const res = await app
            .post('/api/v1/aggregators/register')
            .send(sampleAggregators[0]);
          const { isVerified } = res.body.aggregator;
          expect(isVerified).toBe(false);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('sets "pending" to true by default', async (done) => {
        try {
          const res = await app
            .post('/api/v1/aggregators/register')
            .send(sampleAggregators[0]);
          const { pending } = res.body.aggregator;
          expect(pending).toBe(true);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 error if sequelize error is encountered', async (done) => {
        try {
          const originalImplementation = Aggregator.create;
          Aggregator.create = jest.fn().mockImplementation(() => undefined);
          const res = await app
            .post('/api/v1/aggregators/register')
            .send(sampleAggregators[0]);
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty(
            'error',
            "Cannot read property 'dataValues' of undefined"
          );
          Aggregator.create = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('verifyAggregatorAndCreatePassword', () => {
    let email, passCode;
    beforeEach(async () => {
      const {
        body: { aggregator },
      } = await app
        .post('/api/v1/aggregators/register')
        .send(sampleAggregators[0]);
      email = aggregator.email;
      const aggregatorId = aggregator.id;
      const otp = await Otp.findOne({ where: { aggregatorId } });
      passCode = otp.dataValues.passCode;
    });
    describe('try', () => {
      it('returns a success message on succesful verification', async (done) => {
        try {
          const res = await app.post('/api/v1/aggregators/verify').send({
            email,
            otp: `${passCode}`,
            password: 'testing',
          });
          expect(res.body).toHaveProperty(
            'message',
            'verification completed successfully'
          );
          done();
        } catch (e) {
          done(e);
        }
      });
      it('sets the users isVerified value to true', async (done) => {
        try {
          await app.post('/api/v1/aggregators/verify').send({
            email,
            otp: `${passCode}`,
            password: 'testing',
          });
          const { isVerified } = await Aggregator.findOne({
            where: { email },
            raw: true,
          });
          expect(isVerified).toBe(true);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('creates a new password for the user', async (done) => {
        try {
          const originalImplementation = bcrypt.hashSync;
          bcrypt.hashSync = jest.fn().mockReturnValue(sampleHash);
          await app.post('/api/v1/aggregators/verify').send({
            email,
            otp: `${passCode}`,
            password: 'testing',
          });
          const {
            id,
            password: { aggregatorId, password },
          } = await Aggregator.findOne({
            where: { email },
            attributes: ['id', 'email'],
            include: { model: AggregatorPassword, as: 'password' },
            raw: true,
            nest: true,
          });
          bcrypt.hashSync = originalImplementation;
          expect(id).toEqual(aggregatorId);
          expect(password).toEqual(sampleHash);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('adds the new password to the passwordHistory table', async (done) => {
        try {
          const originalImplementation = bcrypt.hashSync;
          bcrypt.hashSync = jest.fn().mockReturnValue(sampleHash);
          await app.post('/api/v1/aggregators/verify').send({
            email,
            otp: `${passCode}`,
            password: 'testing',
          });
          const {
            dataValues: { passwordHistory },
          } = await Aggregator.findOne({
            where: { email },
            attributes: ['id'],
            include: {
              model: AggregatorPasswordHistory,
              as: 'passwordHistory',
            },
          });
          const passwords = passwordHistory.map(
            ({ dataValues }) => dataValues.password
          );
          bcrypt.hashSync = originalImplementation;
          expect(Array.isArray(passwordHistory)).toBe(true);
          expect(passwords).toContain(sampleHash);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('catches any error in the catch block and returns 500', async (done) => {
        try {
          const originalImplementation = Aggregator.update;
          const sampleError = "let's pretend something went wrong";
          Aggregator.update = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app.post('/api/v1/aggregators/verify').send({
            email,
            otp: `${passCode}`,
            password: 'testing',
          });
          expect(res.status).toBe(500);
          expect(res.body).toHaveProperty('error', sampleError);
          Aggregator.update = originalImplementation;
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('saveAggregatorOtp', () => {
    let email, currentPassCode, aggregatorId;
    beforeEach(async () => {
      const {
        body: { aggregator },
      } = await app
        .post('/api/v1/aggregators/register')
        .send(sampleAggregators[0]);
      email = aggregator.email;
      aggregatorId = aggregator.id;
      const currentOtp = await Otp.findOne({ where: { aggregatorId } });
      currentPassCode = currentOtp.dataValues.passCode;
    });
    describe('try', () => {
      it('informsm the user "The OTP has been sent to your mail"', async (done) => {
        try {
          const res = await app
            .post('/api/v1/aggregators/resend_otp')
            .send({ email });
          const responseMessage = 'The OTP has been sent to your mail';
          expect(res.body).toHaveProperty('message', responseMessage);
          done();
        } catch (e) {
          done(e);
        }
      });

      it('generates and saves a different passCode for the user', async (done) => {
        try {
          await app.post('/api/v1/aggregators/resend_otp').send({ email });
          const newOtp = await Otp.findOne({ where: { aggregatorId } });
          const newPassCode = newOtp.dataValues.passCode;
          expect(currentPassCode).not.toEqual(newPassCode);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 errors in the catch block', async (done) => {
        try {
          const originalImplementation = Otp.upsert;
          const sampleError = 'let"s prentend something went wrong';
          Otp.upsert = jest.fn().mockImplementation(() => {
            throw new Error(sampleError);
          });
          const res = await app
            .post('/api/v1/aggregators/resend_otp')
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
  describe('getAggregators', () => {
    describe('try', () => {
      it('returns 200 on successful get', async (done) => {
        try {
          const registeredAggs = await registerAggregators();
          const adminToken = await getAdminToken();
          const res = await app
            .get('/api/v1/aggregators')
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.aggregators).toHaveLength(registeredAggs.length);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 for errors caught in the try block', async (done) => {
        try {
          await registerAggregators();
          const adminToken = await getAdminToken();
          const originalImplementation = Aggregator.findAll;
          Aggregator.findAll = jest.fn().mockImplementation(() => {
            throw new Error('bummer!!');
          });
          const res = await app
            .get('/api/v1/aggregators')
            .set('authorization', adminToken);
          Aggregator.findAll = originalImplementation;
          expect(res.status).toBe(500);
          done();
        } catch (e) {
          done();
        }
      });
    });
  });
  describe('getAggregatorById', () => {
    describe('try', () => {
      it('returns 200 on successful get', async (done) => {
        try {
          const aggregators = await registerAggregators();
          const adminToken = await getAdminToken();
          const res = await app
            .get(`/api/v1/aggregators/${aggregators[0].id}`)
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.aggregator).toEqual(
            expect.objectContaining({
              id: aggregators[0].id,
              email: aggregators[0].email,
              apiKey: aggregators[0].apiKey,
            })
          );
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    describe('catch', () => {
      it('returns 500 for errors thrown in the catch block', async (done) => {
        try {
          const req = { params: undefined };
          const res = { body: {} };
          const next = jest.fn();
          await getAggregatorById(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('approveAggregator', () => {
    describe('try', () => {
      it('successfully approves the aggregator', async (done) => {
        try {
          await resetDB();
          const aggregator = await registerOneAggregator(sampleAggregators[0]);
          const adminToken = await getAdminToken();
          const res = await app
            .patch(`/api/v1/aggregators/${aggregator.id}/approve`)
            .set('authorization', adminToken);
          expect(res.status).toBe(200);
          expect(res.body.aggregator).toHaveProperty('pending', false);
          done();
        } catch (e) {
          done(e);
        }
      });
      it('returns 400 error if the specified aggregaorId does not exists', async (done) => {
        try {
          await resetDB();
          const adminToken = await getAdminToken();
          const res = await app
            .patch('/api/v1/aggregators/1/approve')
            .set('authorization', adminToken);
          expect(res.status).toBe(400);
          const errorMsg = 'no record matches the aggregator id of 1';
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
          await approveAggregator(req, res, next);
          expect(next).toHaveBeenCalled();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
