/* eslint-disable no-unused-vars */
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;
module.exports = (sequelize, DataTypes) => {
  const AggregatorPassword = sequelize.define(
    'AggregatorPassword',
    {
      aggregatorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        unique: true,
        references: {
          model: 'Aggregators',
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
  AggregatorPassword.associate = function (models) {
    AggregatorPassword.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
    });
  };
  AggregatorPassword.addHook('beforeValidate', async (record) => {
    if (record.password) {
      record.password = bcrypt.hashSync(
        record.password,
        Number(BCRYPT_SALT_VALUE)
      );
    }
  });

  return AggregatorPassword;
};
