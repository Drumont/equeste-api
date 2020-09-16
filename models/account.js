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
      // define association here
      models.Account.belongsTo(models.User, {
        foreignKey: {
          allowNull: false
        }
      })
    }
  };
  Account.init({
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    licence: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};
