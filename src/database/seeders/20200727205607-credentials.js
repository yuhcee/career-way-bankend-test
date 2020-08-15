'use strict';
import aes from '../../utils/Aes';
import { setDays } from '../../utils/dateFunctons';

const aesKey = aes.encrypt('ik902mk2)(!lah9L');
const ivKey = aes.encrypt('#4ik902JUK98ah9L');
const expires = setDays(30);

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'Credentials',
      [
        {
          aggregatorId: 1,
          appId: '31caf471-7867-4618-ad9c-57a6a25f9db6',
          aesKey,
          ivKey,
          expires,
        },
        {
          aggregatorId: 2,
          appId: '31caf471-7867-4618-ad9c-1234567890ad',
          aesKey: aes.encrypt('1234567891234567'),
          ivKey: aes.encrypt('abcdefghijklmnop'),
          expires,
        },
        {
          aggregatorId: 3,
          appId: '31caf471-7867-8164-ad9c-4567890ad123',
          aesKey: aes.encrypt('1234567891234999'),
          ivKey: aes.encrypt('abcdefghijklm@#$'),
          expires,
        },
        {
          merchantId: 2,
          appId: '31caf471-7867-4618-ad9c-ad0987654321',
          aesKey: aes.encrypt('7654321987654321'),
          ivKey: aes.encrypt('ponmlkjihgfedcba'),
          expires,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Credentials');
  },
};
