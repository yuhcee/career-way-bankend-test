/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */

module.exports = (sequelize, DataTypes) => {
  const Aggregator = sequelize.define(
    'Aggregator',
    {
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      agid: {
        unique: true,
        allowNull: true,
        type: DataTypes.STRING,
      },
      businessYears: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      websiteLink: {
        type: DataTypes.STRING,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bvn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
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
    },
    {}
  );
  Aggregator.associate = (models) => {
    Aggregator.hasMany(models.Merchant, {
      foreignKey: 'aggregatorId',
      as: 'merchants',
      onDelete: 'RESTRICT',
    });
    Aggregator.hasOne(models.AggregatorPrimaryContact, {
      foreignKey: 'aggregatorId',
      as: 'primaryContact',
      onDelete: 'CASCADE',
    });
    Aggregator.hasOne(models.AggregatorSecondaryContact, {
      foreignKey: 'aggregatorId',
      as: 'secondaryContact',
      onDelete: 'CASCADE',
    });
    Aggregator.hasOne(models.Otp, {
      foreignKey: 'aggregatorId',
      as: 'otp',
      onDelete: 'CASCADE',
    });
    Aggregator.hasOne(models.AggregatorPassword, {
      foreignKey: 'aggregatorId',
      as: 'password',
      onDelete: 'CASCADE',
    });
    Aggregator.hasMany(models.AggregatorPasswordHistory, {
      foreignKey: 'aggregatorId',
      as: 'passwordHistory',
      onDelete: 'CASCADE',
    });
    Aggregator.hasMany(models.AggregatorPercentageCharge, {
      foreignKey: 'aggregatorId',
      as: 'percentageCharges',
      onDelete: 'CASCADE',
    });
    Aggregator.hasOne(models.Credential, {
      foreignKey: 'aggregatorId',
      as: 'credentials',
      onDelete: 'CASCADE',
    });
  };
  return Aggregator;
};
