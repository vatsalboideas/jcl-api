'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      media.hasMany(models.workData, {
        foreignKey: 'landscapeImage',
        as: 'landscapeWorkData',
      });
      media.hasMany(models.workData, {
        foreignKey: 'verticalImage',
        as: 'verticalWorkData',
      });
      media.hasMany(models.workData, {
        foreignKey: 'squareImage',
        as: 'squareWorkData',
      });

      // Association for workDetailData
      media.hasMany(models.workDetailData, {
        foreignKey: 'media',
        as: 'detailMedia',
      });
    }
  }
  media.init(
    {
      mediaId: DataTypes.UUID,
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      size: DataTypes.INTEGER,
      url: DataTypes.STRING,
      mime: DataTypes.STRING,
      height: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'media',
    }
  );
  return media;
};
