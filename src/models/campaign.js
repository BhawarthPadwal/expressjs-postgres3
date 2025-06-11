const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaigns', {
    campaignId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true // Assuming campaignId is auto-incremented
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    users_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Users', // Name of the referenced model
            key: 'userId' // Key in the referenced model
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Default to current date if not provided
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'Campaigns', // Specify the table name
});

module.exports = Campaign;