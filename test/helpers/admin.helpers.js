/* eslint-disable jest/no-test-callback */
/* eslint-disable quotes */
import axios from 'axios';
import supertest from 'supertest';
import server from '../../src/app';

const app = supertest(server);

export const getAdminToken = async () => {
  const originalImplementation = axios.post;
  axios.post = jest.fn().mockImplementation(() => {
    return { data: { userExist: true } };
  });
  const {
    body: { token: adminToken },
  } = await app.post('/api/v1/admin/login').send({
    username: 'valid_NT_username',
    password: 'valid_NT_password',
  });
  axios.post = originalImplementation;
  return adminToken;
};
