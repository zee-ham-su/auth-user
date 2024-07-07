const sequelize = require('../db');
const { DataTypes } = require('sequelize');
const User = require('./user');

const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

// Define UserOrganisation association
User.belongsToMany(Organisation, { through: 'UserOrganisation' });
Organisation.belongsToMany(User, { through: 'UserOrganisation' });

// Sync models with the database
sequelize.sync({ force: false }) // Set force to true to drop and recreate tables
  .then(() => {
    console.log('Models synced with database.');
  })
  .catch((error) => {
    console.error('Unable to sync models with database:', error);
  });

module.exports = Organisation;
