import supertest from 'supertest';
import server from '../../src/app';
import db from '../../src/database/models';
import {
  sampleMerchants,
  MERCHANT_PASSWORD,
  sampleAggregators,
} from '../sampleData';
import { registerOneAggregator } from './aggregator.helpers';

const { Otp } = db;

const app = supertest(server);

export const registerMerchants = async () => {
  const aggregator = await registerOneAggregator(sampleAggregators[0]);
  const registeredMerchants = [];
  for (let i = 0; i < sampleMerchants.length; i++) {
    const {
      body: { merchant },
    } = await app.post('/api/v1/merchants/register').send({
      aggregatorId: aggregator.id,
      ...sampleMerchants[i],
    });
    const otp = await Otp.findOne({
      where: { merchantId: merchant.id },
    });
    const res = await app.post('/api/v1/merchants/verify').send({
      otp: otp.passCode.toString(),
      email: merchant.email,
      password: MERCHANT_PASSWORD,
    });
    registeredMerchants.push(res.body.aggregator);
  }
  return registeredMerchants;
};

export const registerOneMerchant = async (
  merch = sampleMerchants[0],
  aggr = sampleAggregators[0]
) => {
  const aggregator = await registerOneAggregator(aggr);
  const {
    body: { merchant },
  } = await app.post('/api/v1/merchants/register').send({
    aggregatorId: aggregator.id,
    ...merch,
  });
  const otp = await Otp.findOne({
    where: { merchantId: merchant.id },
  });
  const res = await app.post('/api/v1/merchants/verify').send({
    otp: otp.passCode.toString(),
    email: merchant.email,
    password: MERCHANT_PASSWORD,
  });

  return res.body.merchant;
};

export const getMerchantToken = async (registeredMerchant) => {
  const {
    body: { token },
  } = await app.post('/api/v1/merchants/login').send({
    email: registeredMerchant.email,
    password: MERCHANT_PASSWORD,
  });

  return token;
};
