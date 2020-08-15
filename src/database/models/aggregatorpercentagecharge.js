'use strict';
module.exports = (sequelize, DataTypes) => {
  const AggregatorPercentageCharge = sequelize.define(
    'AggregatorPercentageCharge',
    {
      aggregatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Aggregators',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      paymentTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'PaymentTypes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      percentageCharge: {
        type: DataTypes.DECIMAL(6, 3),
        allowNull: false,
      },
    },
    {}
  );
  AggregatorPercentageCharge.associate = function (models) {
    AggregatorPercentageCharge.belongsTo(models.Aggregator, {
      foreignKey: 'aggregatorId',
      as: 'aggregator',
    });
    AggregatorPercentageCharge.belongsTo(models.PaymentType, {
      foreignKey: 'paymentTypeId',
      as: 'paymentType',
    });
  };
  return AggregatorPercentageCharge;
};
