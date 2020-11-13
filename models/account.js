'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //define association here
      //models.Account.belongsTo(models.User, {foreignKey: {name: 'user_id'}})
      //models.Account.hasOne(models.User, {foreignKey: {name: 'account_id'}})
    }
  };
  Account.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    licence: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};
