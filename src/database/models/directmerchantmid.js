'use strict';
module.exports = (sequelize, DataTypes) => {
  const DirectMerchantMID = sequelize.define(
    'DirectMerchantMID',
    {
      merchantId: {
        unique: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      mid: {
        unique: true,
        type: DataTypes.STRING,
      },
    },
    {}
  );
  DirectMerchantMID.associate = function (models) {
    DirectMerchantMID.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'owner',
    });
  };
  return DirectMerchantMID;
};
