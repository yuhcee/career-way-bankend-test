/* eslint-disable no-unused-vars */
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;
module.exports = (sequelize, DataTypes) => {
  const MerchantPassword = sequelize.define(
    'MerchantPassword',
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
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {}
  );
  MerchantPassword.associate = function (models) {
    MerchantPassword.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
    });
  };
  MerchantPassword.addHook('beforeValidate', async (record) => {
    if (record.password) {
      record.password = bcrypt.hashSync(
        record.password,
        Number(BCRYPT_SALT_VALUE)
      );
    }
  });
  return MerchantPassword;
};
