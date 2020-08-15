/* eslint-disable jest/no-test-callback */
/* eslint-disable quotes */
import Joi from '@hapi/joi';
import supertest from 'supertest';
import db from '../../src/database/models';
import server from '../../src/app';
import { sampleAggregators } from '../sampleData/aggregators.sample';

import {
  validateAggregatorDetails,
  formatAggregatorReqBody,
  checkAggregatorVerificationDetails,
} from '../../src/middlewares/aggregatorMiddleware';

const { Aggregator, Merchant } = db;

const app = supertest(server);

describe('aggregatorMiddleware', () => {
  let mockRequest, mockResponse, next;
  beforeEach(async () => {
    await Merchant.destroy({ where: {}, truncate: { cascade: true } });
    await Aggregator.destroy({ where: {}, truncate: { cascade: true } });
    mockRequest = (data) => {
      return {
        body: data,
      };
    };
    mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    next = jest.fn((msg) => msg);
  });

  describe('validateAggregatorDetails', () => {
    it('returns 500 for errors thrown in "try" block', async (done) => {
      try {
        const originalImplementation = Joi.object;
        const sampleError = 'let"s pretend something went wrong';
        Joi.object = jest.fn().mockImplementation(() => {
          throw new Error(sampleError);
        });

        const req = mockRequest(sampleAggregators[1]);
        const res = mockResponse();
        await validateAggregatorDetails(req, res, next);
        expect(next).toHaveBeenCalledWith(sampleError);
        Joi.object = originalImplementation;
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe('validateAggregatorEmail', () => {
    it('returns 400 error if no matching record is found for the supplied email', async (done) => {
      try {
        const res = await app
          .post('/api/v1/aggregators/resend_otp')
          .send({ email: 'non_existing_in_db@gmail.com' });
        expect(res.status).toBe(404);
        const expectedErrorMsg =
          'we could not find the email non_existing_in_db@gmail.com in our system; please signup first';
        expect(res.body).toHaveProperty('error', expectedErrorMsg);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('returns 500 errors in the catch block', async (done) => {
      try {
        const originalImplementation = Joi.object;
        const sampleError = 'let"s pretend something went wrong';
        Joi.object = jest.fn().mockImplementation(() => {
          throw new Error(sampleError);
        });
        const res = await app
          .post('/api/v1/aggregators/resend_otp')
          .send({ email: sampleAggregators[0].email });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error', sampleError);
        Joi.object = originalImplementation;
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe('formatAggregatorReqBody', () => {
    it('returns 500 error in the catch block', async (done) => {
      try {
        const res = mockResponse();
        const req = mockRequest(undefined);
        await formatAggregatorReqBody(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(true).toBe(true);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  describe('checkAggregatorVerificationDetails', () => {
    it('returns 500 errors in the catch block', async (done) => {
      try {
        const originalImplementation = Joi.object;
        const sampleError = 'let"s pretend something went wrong';
        Joi.object = jest.fn().mockImplementation(() => {
          throw new Error(sampleError);
        });
        const req = mockRequest(sampleAggregators[0]);
        const res = mockResponse();
        await checkAggregatorVerificationDetails(req, res, next);
        expect(next).toHaveBeenCalledWith(sampleError);
        Joi.object = originalImplementation;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
