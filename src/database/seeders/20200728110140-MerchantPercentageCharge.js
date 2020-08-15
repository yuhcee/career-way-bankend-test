'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'MerchantPercentageCharges',
      [
        {
          merchantId: 1,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          merchantId: 2,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          merchantId: 3,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          merchantId: 4,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          merchantId: 5,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
        {
          merchantId: 6,
          paymentTypeId: 2,
          percentageCharge: 0.2,
        },
        {
          merchantId: 7,
          paymentTypeId: 1,
          percentageCharge: 0.1,
        },
      ],
      {}
    );
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('MerchantPercentageCharges');
  },
};
