'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      transactionId: {
        unique: true,
        type: DataTypes.STRING,
        allowNull: false,
      },
      reconciliationId: {
        unique: {
          args: true,
          message: 'reconciliationId must be unique.',
        },
        type: DataTypes.STRING,
        allowNull: true,
      },
      merchantId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      cardHolder: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM('VISA', 'MASTERCARD', 'VERVE'),
        defaultValue: 'VISA',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      settlement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      channel: {
        type: DataTypes.STRING,
        defaultValue: 'WC',
        allowNull: false,
      },
      fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      switchFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionRef: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      submitTimeUtc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aggregatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Aggregators',
          key: 'id',
        },
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reversalId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      validate: {
        reconciliationIdValidationError() {
          if (this.reconciliationId && this.status === 'PENDING') {
            throw new Error(
              'a transaction with status PENDING cannot have reconciliationId'
            );
          }
          if (
            !this.reconciliationId &&
            (this.status === 'SUCCESSFUL' || this.status === 'FAILED')
          ) {
            throw new Error(
              'every transaction with status FAILED or SUCCESSFUL must have a reconciliation id'
            );
          }
        },
      },
    }
  );
  Transaction.associate = function (models) {
    Transaction.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant',
    });
  };
  return Transaction;
};
