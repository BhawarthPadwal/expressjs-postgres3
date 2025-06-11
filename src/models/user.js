const { DataTypes } = require('sequelize');
const sequelize  = require('../config/database');

const User = sequelize.define('Users', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    emailId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

},
    {
        tableName: 'Users', // Specify the table name
        timestamps: false // Disable createdAt and updatedAt fields
    }
);

module.exports = User;