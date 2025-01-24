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
      workData.hasMany(models.workDetailData, {
        foreignKey: 'workId',
        sourceKey: 'workId',
        as: 'workDetails',
      });

      workData.hasOne(models.media, {
        foreignKey: 'mediaId', // Refers to the column in the `media` table
        sourceKey: 'landscapeImage', // Refers to the column in the `workData` table
        as: 'landscapeImageData',
      });

      workData.hasOne(models.media, {
        foreignKey: 'mediaId', // Refers to the column in the `media` table
        sourceKey: 'verticalImage', // Refers to the column in the `workData` table
        as: 'verticalImageData',
      });

      workData.hasOne(models.media, {
        foreignKey: 'mediaId', // Refers to the column in the `media` table
        sourceKey: 'squareImage', // Refers to the column in the `workData` table
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
