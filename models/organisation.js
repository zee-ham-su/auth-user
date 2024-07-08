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


module.exports = Organisation;
