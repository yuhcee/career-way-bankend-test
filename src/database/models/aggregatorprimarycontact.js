/* eslint-disable no-unused-vars */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const AggregatorPrimaryContact = sequelize.define('AggregatorPrimaryContact',  {
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
      allowNull: false,
      type: DataTypes.STRING
    },
    phoneNumber: {
      allowNull: false,
      type: DataTypes.STRING
    },
    telephone: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING
    },
  }, {});
  AggregatorPrimaryContact.associate = function(models) {
    AggregatorPrimaryContact.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'owner',
    });
  };
  return AggregatorPrimaryContact;
};