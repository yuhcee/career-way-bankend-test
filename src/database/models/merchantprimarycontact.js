/* eslint-disable no-unused-vars */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const MerchantPrimaryContact = sequelize.define(
    'MerchantPrimaryContact',
    {
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      telephone: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {}
  );
  MerchantPrimaryContact.associate = function (models) {
    MerchantPrimaryContact.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'owner',
    });
  };
  return MerchantPrimaryContact;
};
