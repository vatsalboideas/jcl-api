'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class workData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // workData.hasMany(models.workDetailData, {
      //   foreignKey: 'detailsData',
      //   sourceKey: 'workId',
      //   as: 'details'
      // });

      // Media associations
      workData.hasOne(models.media, {
        foreignKey: 'landscapeImage',
        targetKey: 'mediaId',
        as: 'landscapeImageData',
      });
      workData.hasOne(models.media, {
        foreignKey: 'verticalImage',
        targetKey: 'mediaId',
        as: 'verticalImageData',
      });
      workData.hasOne(models.media, {
        foreignKey: 'squareImage',
        targetKey: 'mediaId',
        as: 'squareImageData',
      });
    }
  }
  workData.init(
    {
      workId: DataTypes.UUID,
      name: DataTypes.STRING,
      landscapeImage: DataTypes.UUID,
      verticalImage: DataTypes.UUID,
      squareImage: DataTypes.UUID,
      data: DataTypes.STRING,
      websiteLink: DataTypes.STRING,
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      detailsData: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'workData',
    }
  );
  return workData;
};
