'use strict';
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;

const password = bcrypt.hashSync('testing', Number(BCRYPT_SALT_VALUE));

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'MerchantPasswords',
      [
        {
          merchantId: 1,
          password,
        },
        {
          merchantId: 2,
          password,
        },
        {
          merchantId: 3,
          password,
        },
        {
          merchantId: 4,
          password,
        },
        {
          merchantId: 5,
          password,
        },
        {
          merchantId: 6,
          password,
        },
        {
          merchantId: 7,
          password,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('MerchantPasswords');
  },
};
