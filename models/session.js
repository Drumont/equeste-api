'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Session.belongsTo(models.User, {foreignKey: { name: 'user_id'}}),
      models.Session.belongsTo(models.Horse, {foreignKey: { name: 'horse_id'}})
      models.Session.belongsTo(models.Course, {foreignKey: { name: 'course_id'}})
    }
  };
  Session.init({
    course_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    horse_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};
