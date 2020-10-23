'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Horse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Horse.belongsTo(models.User)
    }
  };
  Horse.init({
    name: DataTypes.STRING,
    createdBy_id: DataTypes.INTEGER,
    breed: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Horse',
  });
  return Horse;
};
