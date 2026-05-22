const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = require('./config/database');
class Recuperation extends Model {}

Recuperation.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  ExpirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  }
}, {
  sequelize,
  tableName: 'Recuperation',
  timestamps: false
});

module.exports = Recuperation;
