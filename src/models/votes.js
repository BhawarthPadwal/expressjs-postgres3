const { DataTypes } = require("sequelize")

const sequelize = require("../config/database");
const Campaigns = require("./campaign"); // Assuming campaigns.js is in the same directory

const Vote = sequelize.define("Votes", {
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: "Campaigns", // Name of the referenced model
        key: "campaignId" // Key in the referenced model
        }
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
        model: "Users", // Name of the referenced model
        key: "userId" // Key in the referenced model
        }
    },
    voteType: {
        type: DataTypes.ENUM("upvote", "downvote"),
        allowNull: false
    }
}, {
  tableName: "Votes", // Specify the table name
//   timestamps: false, // Disable createdAt and updatedAt fields
  indexes: [
    {
      unique: true,
      fields: ["campaignId", "userId"]
    }
  ]
});

module.exports = Vote;