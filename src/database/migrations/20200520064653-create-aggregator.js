/* eslint-disable no-unused-vars */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Aggregators',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        companyName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        agid: {
          unique: true,
          allowNull: true,
          type: Sequelize.STRING,
        },
        businessYears: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        phoneNumber: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        email: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING,
        },
        websiteLink: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        accountNumber: {
          allowNull: false,
          type: Sequelize.STRING,
          unique: true,
        },
        bvn: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        address: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        isVerified: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        isActive: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        pending: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        approvedBy: {
          type: Sequelize.STRING,
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
    return queryInterface.dropTable('Aggregators');
  },
};
