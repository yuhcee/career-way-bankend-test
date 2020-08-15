/* eslint-disable no-unused-vars */
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'Transactions',
          'fee',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'switchFee',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'transactionRef',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'orderId',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'submitTimeUtc',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'aggregatorId',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Aggregators',
              key: 'id',
            },
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'details',
          {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Transactions',
          'reversalId',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('Transactions', 'fee', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'switchFee', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'transactionRef', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'orderId', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'submitTimeUtc', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'aggregatorId', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'details', {
          transaction: t,
        }),
        queryInterface.removeColumn('Transactions', 'reversalId', {
          transaction: t,
        }),
      ]);
    });
  },
};
