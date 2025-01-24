// 'use strict';
// const { Model } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class media extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//       // media.hasMany(models.workData, {
//       //   foreignKey: 'landscapeImage',
//       //   as: 'landscapeWorks',
//       // });
//       // media.hasMany(models.workData, {
//       //   foreignKey: 'verticalImage',
//       //   as: 'verticalData',
//       // });
//       // media.hasMany(models.workData, {
//       //   foreignKey: 'squareImage',
//       //   as: 'squareData',
//       // });
//       // // Association for workDetailData
//       // media.hasMany(models.workDetailData, {
//       //   foreignKey: 'media',
//       //   as: 'mediaData',
//       // });
//     }
//   }
//   media.init(
//     {
//       mediaId: DataTypes.UUID,
//       name: DataTypes.STRING,
//       type: DataTypes.STRING,
//       size: DataTypes.INTEGER,
//       url: DataTypes.STRING,
//       mime: DataTypes.STRING,
//       height: DataTypes.INTEGER,
//       width: DataTypes.INTEGER,
//     },
//     {
//       sequelize,
//       modelName: 'media',
//     }
//   );
//   return media;
// };
'use strict';
const { Model } = require('sequelize');
const {
  encrypt,
  decrypt,
} = require('../middlewares/database.encrypt.decrypt.middleware');

module.exports = (sequelize, DataTypes) => {
  class media extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    // Instance method to decrypt specific fields
    decryptFields(fields) {
      fields.forEach((field) => {
        const value = this.get(field);
        if (value) {
          this.setDataValue(field, decrypt(value));
        }
      });
      return this;
    }

    // Static method to decrypt multiple instances
    static decryptInstances(instances, fields) {
      return instances.map((instance) => {
        instance.decryptFields(fields);
        return instance;
      });
    }
  }

  media.init(
    {
      mediaId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('name', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('name');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      type: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('type', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('type');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      size: DataTypes.INTEGER,
      url: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('url', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('url');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      mime: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('mime', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('mime');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      height: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'media',
      hooks: {
        beforeCreate: (instance) => {
          // Additional preprocessing if needed
        },
        beforeUpdate: (instance) => {
          // Additional preprocessing if needed
        },
      },
    }
  );

  return media;
};
