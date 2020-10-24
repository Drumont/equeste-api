'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasOne(models.Account),
      models.User.hasOne(models.Permission),
      models.User.hasMany(models.Horse),
      models.User.hasMany(models.Course)
      models.User.hasMany(models.Session)
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    account_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
