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
      // workDetailData.belongsTo(models.workData, {
      //   foreignKey: 'detailsData',
      //   targetKey: 'workId',
      //   as: 'work'
      // });
      // Media association
      // workDetailData.belongsTo(models.media, {
      //   foreignKey: 'media',
      //   targetKey: 'mediaId',
      //   as: 'mediaData'
      // });
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
    },
    {
      sequelize,
      modelName: 'workDetailData',
    }
  );
  return workDetailData;
};
