'use strict';
module.exports = (sequelize, DataTypes) => {
  const ExternalMerchantMID = sequelize.define(
    'ExternalMerchantMID',
    {
      merchantId: {
        unique: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      mid: {
        unique: true,
        type: DataTypes.STRING,
      },
    },
    {}
  );
  ExternalMerchantMID.associate = function (models) {
    // associations can be defined here
    ExternalMerchantMID.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'owner',
    });
  };
  return ExternalMerchantMID;
};
