/* eslint-disable no-unused-vars */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const PaymentType = sequelize.define(
    'PaymentType',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {}
  );
  PaymentType.associate = function (models) {
    PaymentType.hasMany(models.AggregatorPercentageCharge, {
      foreignKey: 'paymentTypeId',
      as: 'aggregatorPercentageCharge',
    });
    PaymentType.hasMany(models.MerchantPercentageCharge, {
      foreignKey: 'paymentTypeId',
      as: 'merchantPercentageCharge',
    });
  };
  return PaymentType;
};
