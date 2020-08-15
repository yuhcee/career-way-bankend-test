/* eslint-disable no-unused-vars */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const MerchantSecondaryContact = sequelize.define(
    'MerchantSecondaryContact',
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
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      telephone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
    },
    {}
  );
  MerchantSecondaryContact.associate = function (models) {
    MerchantSecondaryContact.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'owner',
    });
  };
  return MerchantSecondaryContact;
};
