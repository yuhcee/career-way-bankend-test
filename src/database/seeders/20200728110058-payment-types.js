'use strict';
module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'PaymentTypes',
      [
        {
          name: 'card',
        },
        {
          name: 'account',
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('PaymentTypes');
  },
};
