'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class careerForms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      careerForms.hasOne(models.Media, {
        as: 'resumePDF',
        foreignKey: 'mediaId',
        sourceKey: 'resume',
      });
    }
  }
  careerForms.init(
    {
      careerId: DataTypes.UUID,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      contactNumber: DataTypes.STRING,
      portfolioLink: DataTypes.STRING,
      message: DataTypes.STRING,
      emailId: DataTypes.STRING,
      resume: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'careerForms',
    }
  );
  return careerForms;
};
