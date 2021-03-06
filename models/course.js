'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Course.belongsTo(models.User, {foreignKey: { name: 'createdBy_id'}})
    }
  };
  Course.init({
    title: DataTypes.STRING,
    level: DataTypes.STRING,
    max_participant: DataTypes.STRING,
    started_date: DataTypes.DATE,
    duration: DataTypes.INTEGER,
    createdBy_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};
