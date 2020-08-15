'use strict';

module.exports = (sequelize, DataTypes) => {
  const SocialpayMID = sequelize.define(
    'SocialpayMID',
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
  SocialpayMID.associate = function (models) {
    SocialpayMID.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'owner',
    });
  };
  return SocialpayMID;
};
