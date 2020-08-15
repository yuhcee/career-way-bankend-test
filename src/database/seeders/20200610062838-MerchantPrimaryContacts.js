'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'MerchantPrimaryContacts',
      [
        {
          merchantId: 1,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 2,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 3,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 4,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 5,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 6,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          merchantId: 7,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('MerchantPrimaryContacts');
  },
};
