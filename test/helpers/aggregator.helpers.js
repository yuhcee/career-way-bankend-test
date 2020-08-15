import supertest from 'supertest';
import server from '../../src/app';
import db from '../../src/database/models';
import { sampleAggregators, AGGREGATOR_PASSWORD } from '../sampleData';

const { Aggregator, Otp } = db;

const app = supertest(server);

export const registerAggregators = async () => {
  const registeredAggs = [];
  for (let i = 0; i < sampleAggregators.length; i++) {
    const {
      body: { aggregator },
    } = await app
      .post('/api/v1/aggregators/register')
      .send(sampleAggregators[i]);
    const otp = await Otp.findOne({
      where: { aggregatorId: aggregator.id },
    });
    const res = await app.post('/api/v1/aggregators/verify').send({
      otp: otp.passCode.toString(),
      email: aggregator.email,
      password: AGGREGATOR_PASSWORD,
    });
    registeredAggs.push(res.body.aggregator);
  }
  return registeredAggs;
};

export const registerOneAggregator = async (
  sampleAggregator = sampleAggregators[0]
) => {
  const aggAlreadyCreated = await Aggregator.findOne({
    where: { email: sampleAggregator.email },
    raw: true,
  });
  if (aggAlreadyCreated) {
    return aggAlreadyCreated;
  }
  const {
    body: { aggregator },
  } = await app.post('/api/v1/aggregators/register').send(sampleAggregator);
  const otp = await Otp.findOne({
    where: { aggregatorId: aggregator.id },
  });
  const res = await app.post('/api/v1/aggregators/verify').send({
    otp: otp.passCode.toString(),
    email: aggregator.email,
    password: AGGREGATOR_PASSWORD,
  });

  return res.body.aggregator;
};
