'use strict';
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    firstStudentName: DataTypes.STRING,
    secondStudentName: DataTypes.STRING,
    firstStudentFile: DataTypes.TEXT,
    secondStudentFile: DataTypes.TEXT,
    percentageDifference: DataTypes.STRING,
    remarks: DataTypes.TEXT
  }, {});
  Assignment.associate = function(models) {
    // associations can be defined here
  };
  return Assignment;
};