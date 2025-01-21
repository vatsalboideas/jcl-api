'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contactUsForms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  contactUsForms.init(
    {
      contactId: DataTypes.UUID,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      contactNumber: DataTypes.STRING,
      subject: DataTypes.STRING,
      message: DataTypes.STRING,
      emailId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'contactUsForms',
    }
  );
  return contactUsForms;
};
