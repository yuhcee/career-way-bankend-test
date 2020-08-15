/* eslint-disable quotes */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    'Otp',
    {
      aggregatorId: {
        unique: true,
        type: DataTypes.INTEGER,
        references: {
          model: 'Aggregators',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      merchantId: {
        unique: true,
        type: DataTypes.INTEGER,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      passCode: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      expires: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      attempts: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
    },
    {
      sequelize,
      validate: {
        mutuallyExclusiveForeignKeys() {
          if (!this.aggregatorId === !this.merchantId) {
            throw new Error(
              "You must specify one of aggregatorId or merchantId; you can't supply both, and you can't omit both"
            );
          }
        },
      },
    }
  );
  Otp.associate = function (models) {
    Otp.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'aggregator',
    });
    Otp.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant',
    });
  };
  return Otp;
};
