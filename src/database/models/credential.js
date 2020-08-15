'use strict';
import aes from '../../utils/Aes';
module.exports = (sequelize, DataTypes) => {
  const Credential = sequelize.define(
    'Credential',
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
      appId: {
        unique: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      aesKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ivKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      validate: {
        mutuallyExclusiveForeignKeys() {
          if (!this.aggregatorId === !this.merchantId) {
            throw new Error(
              'You must specify one of aggregatorId or merchantId; you can"t supply both, and you can"t omit both'
            );
          }
        },
      },
    }
  );
  Credential.associate = function (models) {
    Credential.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'aggregator',
    });
    Credential.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant',
    });
  };
  Credential.addHook('beforeValidate', async (record) => {
    if (record.aesKey) {
      record.aesKey = aes.encrypt(record.aesKey);
    }
    if (record.ivKey) {
      record.ivKey = aes.encrypt(record.ivKey);
    }
  });
  return Credential;
};
