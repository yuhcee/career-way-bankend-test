/* eslint-disable no-unused-vars */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'AggregatorPercentageCharges',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        aggregatorId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Aggregators',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        paymentTypeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'PaymentTypes',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        percentageCharge: {
          type: Sequelize.DECIMAL(6, 3),
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
      },
      {
        uniqueKeys: {
          Users_unique: {
            fields: ['aggregatorId', 'paymentTypeId'],
          },
        },
        freezeTableName: true,
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AggregatorPercentageCharges');
  },
};
