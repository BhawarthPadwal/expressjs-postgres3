const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("newdb", "postgres", "9876", {
  host: "localhost",
  dialect: "postgres", // or 'postgres', 'sqlite', etc.
  logging: false, // Disable logging; default: console.log
  pool: {
    max: 5, // Maximum number of connection in pool
    min: 0, // Minimum number of connection in pool
    acquire: 30000, // Maximum time (in ms) that pool will try to get a connection before throwing error
    idle: 10000, // Maximum time (in ms) that a connection can be idle before being released
  },
});
module.exports = sequelize;
