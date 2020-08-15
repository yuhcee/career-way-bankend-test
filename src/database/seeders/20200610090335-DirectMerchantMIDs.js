'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'DirectMerchantMIDs',
      [
        {
          merchantId: 3,
          mid: 'ACCESSDM0000001',
        },
        {
          merchantId: 4,
          mid: 'ACCESSDM0000002',
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('DirectMerchantMIDs');
  },
};
