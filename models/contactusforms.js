// 'use strict';
// const { Model } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class contactUsForms extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   contactUsForms.init(
//     {
//       contactId: DataTypes.UUID,
//       firstName: DataTypes.STRING,
//       lastName: DataTypes.STRING,
//       contactNumber: DataTypes.STRING,
//       subject: DataTypes.STRING,
//       message: DataTypes.STRING,
//       emailId: DataTypes.STRING,
//     },
//     {
//       sequelize,
//       modelName: 'contactUsForms',
//     }
//   );
//   return contactUsForms;
// };
'use strict';
const { Model } = require('sequelize');
const {
  encrypt,
  decrypt,
} = require('../middlewares/database.encrypt.decrypt.middleware');

module.exports = (sequelize, DataTypes) => {
  class contactUsForms extends Model {
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

  contactUsForms.init(
    {
      contactId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('firstName', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('firstName');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      lastName: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('lastName', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('lastName');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      contactNumber: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('contactNumber', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('contactNumber');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      subject: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('subject', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('subject');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      message: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('message', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('message');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
      },
      emailId: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue('emailId', encrypt(value));
        },
        get() {
          const encryptedValue = this.getDataValue('emailId');
          return encryptedValue ? decrypt(encryptedValue) : encryptedValue;
        },
        // validate: {
        //   isEmail: true,
        // },
      },
      // isProcessed: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
    },
    {
      sequelize,
      modelName: 'contactUsForms',
      // tableName: 'contact_us_forms',
      // timestamps: true,
      // paranoid: true,
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

  return contactUsForms;
};
