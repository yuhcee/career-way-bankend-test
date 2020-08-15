/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Otps',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        aggregatorId: {
          unique: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'Aggregators',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        merchantId: {
          unique: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'Merchants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        passCode: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        expires: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        attempts: {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 5,
          },
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
    return queryInterface.dropTable('Otps');
  },
};
