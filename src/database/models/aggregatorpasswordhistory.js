/* eslint-disable no-unused-vars */
'use strict';
import bcrypt from 'bcryptjs';
const { BCRYPT_SALT_VALUE } = process.env;
module.exports = (sequelize, DataTypes) => {
  const AggregatorPasswordHistory = sequelize.define(
    'AggregatorPasswordHistory',
    {
      aggregatorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
  AggregatorPasswordHistory.associate = function (models) {
    AggregatorPasswordHistory.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
    });
  };
  AggregatorPasswordHistory.addHook('beforeValidate', async (record) => {
    if (record.password) {
      record.password = bcrypt.hashSync(
        record.password,
        Number(BCRYPT_SALT_VALUE)
      );
    }
  });
  return AggregatorPasswordHistory;
};
