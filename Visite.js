const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Visite = sequelize.define('Visite', {
  ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Date: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  DateDeProgrammation: { 
    type: DataTypes.DATE, 
    allowNull: true, 
  },
  Paye: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  }
}, 
{ tableName: 'Visite',
  timestamps: false 
}
);

module.exports = Visite;
