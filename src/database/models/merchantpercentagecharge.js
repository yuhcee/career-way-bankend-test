'use strict';
module.exports = (sequelize, DataTypes) => {
  const MerchantPercentageCharge = sequelize.define(
    'MerchantPercentageCharge',
    {
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      paymentTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PaymentTypes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      percentageCharge: {
        type: DataTypes.DECIMAL(6, 3),
        allowNull: false,
      },
    },
    {}
  );
  MerchantPercentageCharge.associate = function (models) {
    MerchantPercentageCharge.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant',
    });
    MerchantPercentageCharge.belongsTo(models.PaymentType, {
      foreignKey: 'paymentTypeId',
      as: 'paymentType',
    });
  };
  return MerchantPercentageCharge;
};
