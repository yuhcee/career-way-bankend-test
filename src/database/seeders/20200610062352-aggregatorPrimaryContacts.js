'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'AggregatorPrimaryContacts',
      [
        {
          aggregatorId: 1,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 2,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 3,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 4,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 5,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 6,
          email: 'theprimary@email.com',
          updatedAt: new Date(),
          telephone: '08984347322',
          createdAt: new Date(),
          name: 'The Primary Name',
          phoneNumber: '08033473333',
        },
        {
          aggregatorId: 7,
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
    return queryInterface.bulkDelete('AggregatorPrimaryContacts');
  },
};
