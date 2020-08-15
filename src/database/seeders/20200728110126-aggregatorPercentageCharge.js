'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'AggregatorPercentageCharges',
      [
        {
          aggregatorId: 1,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          aggregatorId: 2,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          aggregatorId: 3,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          aggregatorId: 4,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          aggregatorId: 5,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          aggregatorId: 6,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          aggregatorId: 7,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          aggregatorId: 7,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('AggregatorPercentageCharges');
  },
};
