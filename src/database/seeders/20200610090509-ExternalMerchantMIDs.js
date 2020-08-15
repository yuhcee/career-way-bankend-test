'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'ExternalMerchantMIDs',
      [
        {
          merchantId: 5,
          mid: 'ACCESSAM0000001',
        },
        {
          merchantId: 6,
          mid: 'ACCESSAM0000002',
        },
        {
          merchantId: 7,
          mid: 'ACCESSAM0000003',
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('ExternalMerchantMIDs');
  },
};
