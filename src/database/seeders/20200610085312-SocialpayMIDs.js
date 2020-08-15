'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'SocialpayMIDs',
      [
        {
          merchantId: 1,
          mid: 'ACCESSSP0000001',
        },
        {
          merchantId: 2,
          mid: 'ACCESSSP0000002',
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('SocialpayMIDs');
  },
};
