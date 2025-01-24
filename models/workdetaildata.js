'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class workDetailData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      workDetailData.hasOne(models.media, {
        foreignKey: 'mediaId',
        sourceKey: 'media',
        as: 'mediaData',
      });
    }
  }
  workDetailData.init(
    {
      workDetailId: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      videoUrl: DataTypes.STRING,
      description: DataTypes.STRING,
      name: DataTypes.STRING,
      media: DataTypes.UUID,
      workId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: 'workDetailData',
    }
  );
  return workDetailData;
};
