'use strict';
const crypto = require('crypto');
module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define(
    'Merchant',
    {
      companyName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      aggregatorId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'Aggregators',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      apiKey: {
        unique: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      apiSecret: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: crypto.randomBytes(32).toString('hex'),
      },
      businessYears: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      riskLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
      },
      capAmount: {
        type: DataTypes.STRING,
        defaultValue: '100000',
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      businessType: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      websiteLink: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      accountNumber: {
        unique: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      bvn: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      pending: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      approvedBy: {
        type: DataTypes.STRING,
      },
      region: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      canPayByAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {}
  );
  Merchant.associate = function (models) {
    Merchant.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'aggregator',
    });
    Merchant.hasOne(models.MerchantPrimaryContact, {
      foreignKey: 'merchantId',
      as: 'primaryContact',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.MerchantSecondaryContact, {
      foreignKey: 'merchantId',
      as: 'secondaryContact',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.Otp, {
      foreignKey: 'merchantId',
      as: 'otp',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.MerchantPassword, {
      foreignKey: 'merchantId',
      as: 'password',
      onDelete: 'CASCADE',
    });
    Merchant.hasMany(models.MerchantPasswordHistory, {
      foreignKey: 'merchantId',
      as: 'passwordHistory',
      onDelete: 'CASCADE',
    });
    Merchant.hasMany(models.Transaction, {
      foreignKey: 'merchantId',
      as: 'transactions',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.SocialpayMID, {
      foreignKey: 'merchantId',
      as: 'socialpayMID',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.DirectMerchantMID, {
      foreignKey: 'merchantId',
      as: 'directMID',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.ExternalMerchantMID, {
      foreignKey: 'merchantId',
      as: 'externalMID',
      onDelete: 'CASCADE',
    });
    Merchant.hasMany(models.MerchantPercentageCharge, {
      foreignKey: 'merchantId',
      as: 'percentageCharges',
      onDelete: 'CASCADE',
    });
    Merchant.hasOne(models.Credential, {
      foreignKey: 'merchantId',
      as: 'credentials',
      onDelete: 'CASCADE',
    });
  };
  return Merchant;
};
