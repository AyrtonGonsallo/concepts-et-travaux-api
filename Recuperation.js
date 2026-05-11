const { Sequelize, DataTypes,Model } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);
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
