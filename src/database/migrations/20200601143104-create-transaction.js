/* eslint-disable no-unused-vars */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Transactions',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        transactionId: {
          unique: true,
          type: Sequelize.STRING,
          allowNull: false,
        },
        reconciliationId: {
          unique: true,
          type: Sequelize.STRING,
          allowNull: true,
        },
        merchantId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Merchants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        amount: {
          type: Sequelize.DOUBLE,
          allowNull: false,
        },
        cardHolder: {
          type: Sequelize.STRING,
        },
        type: {
          type: Sequelize.ENUM('VISA', 'MASTERCARD', 'VERVE', 'ACCOUNT_NUMBER'),
          defaultValue: 'VISA',
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
          defaultValue: 'PENDING',
          allowNull: false,
        },
        settlement: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        ip: {
          type: Sequelize.STRING,
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
        freezeTableName: true,
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Transactions');
  },
};
