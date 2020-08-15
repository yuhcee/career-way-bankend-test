/* eslint-disable no-unused-vars */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const AggregatorSecondaryContact = sequelize.define(
    'AggregatorSecondaryContact',
    {
      aggregatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Aggregators',
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
  AggregatorSecondaryContact.associate = function (models) {
    AggregatorSecondaryContact.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'owner',
    });
  };
  return AggregatorSecondaryContact;
};
