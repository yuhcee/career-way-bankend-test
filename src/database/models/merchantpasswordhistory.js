/* eslint-disable no-unused-vars */
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;
module.exports = (sequelize, DataTypes) => {
  const MerchantPasswordHistory = sequelize.define(
    'MerchantPasswordHistory',
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
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {}
  );
  MerchantPasswordHistory.associate = function (models) {
    MerchantPasswordHistory.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
    });
  };
  MerchantPasswordHistory.addHook('beforeValidate', async (record) => {
    if (record.password) {
      record.password = bcrypt.hashSync(
        record.password,
        Number(BCRYPT_SALT_VALUE)
      );
    }
  });
  return MerchantPasswordHistory;
};
