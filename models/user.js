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
      //models.User.hasOne(models.Account, { foreignKey: {name: 'account_id'}})
      //models.User.hasOne(models.Permission),
      //models.User.hasOne(models.Horse),
      //models.User.hasOne(models.Course)
      //models.User.hasOne(models.Session)
      models.User.belongsTo(models.Account, {foreignKey: {name: 'account_id'}})
    }
  };
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    account_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};

