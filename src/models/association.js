const Campaigns = require('./campaign');
const Votes = require('./votes');
const Users = require('./user');

// Campaigns belongs to Users (creator/owner)
Campaigns.belongsTo(Users, { foreignKey: 'users_id', as: 'User' });
Users.hasMany(Campaigns, { foreignKey: 'users_id', as: 'Campaigns' });

// Campaigns has many Votes
Campaigns.hasMany(Votes, { foreignKey: 'campaignId', as: 'Votes' });
Votes.belongsTo(Campaigns, { foreignKey: 'campaignId', as: 'Campaign' });

// Users has many Votes
Users.hasMany(Votes, { foreignKey: 'userId', as: 'Votes' });
Votes.belongsTo(Users, { foreignKey: 'userId', as: 'User' });

module.exports = { Campaigns, Votes, Users };