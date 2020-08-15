/* eslint-disable no-unused-vars */
'use strict';
const crypto = require('crypto');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Merchants',
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
        aggregatorId: {
          allowNull: false,
          type: Sequelize.INTEGER,
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
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        apiSecret: {
          allowNull: true,
          type: Sequelize.STRING,
          defaultValue: crypto.randomBytes(32).toString('hex'),
        },
        businessYears: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        riskLevel: {
          type: Sequelize.ENUM('low', 'medium', 'high'),
        },
        capAmount: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 100000,
          validate: {
            min: 100,
          },
        },
        businessType: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        phoneNumber: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        email: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
        },
        websiteLink: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        accountNumber: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
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
        canPayByAccount: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    return queryInterface.dropTable('Merchants');
  },
};
