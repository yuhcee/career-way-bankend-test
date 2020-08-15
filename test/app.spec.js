/* eslint-disable jest/no-test-callback */
import supertest from 'supertest';
import server from '../src/app';

const app = supertest(server);

describe('server', () => {
  it('responds with 200 OK for GET /', async (done) => {
    try {
      const res = await app.get('/');
      expect(res.status).toBe(200);
      expect(res.body).toBe('success');
      done();
    } catch (e) {
      done(e);
    }
  });

  it('responds with 404 for unknown routes', async (done) => {
    try {
      const res = await app.get('/unknown_endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toBe('dead');
      done();
    } catch (e) {
      done(e);
    }
  });
});
