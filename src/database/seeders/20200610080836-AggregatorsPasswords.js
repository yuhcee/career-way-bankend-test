'use strict';
'use strict';
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;

const password = bcrypt.hashSync('testing', Number(BCRYPT_SALT_VALUE));
module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'AggregatorPasswords',
      [
        {
          aggregatorId: 1,
          password,
        },
        {
          aggregatorId: 2,
          password,
        },
        {
          aggregatorId: 3,
          password,
        },
        {
          aggregatorId: 4,
          password,
        },
        {
          aggregatorId: 5,
          password,
        },
        {
          aggregatorId: 6,
          password,
        },
        {
          aggregatorId: 7,
          password,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('AggregatorPasswords');
  },
};
