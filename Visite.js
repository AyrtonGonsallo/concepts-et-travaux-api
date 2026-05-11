const { Sequelize, DataTypes } = require('sequelize');
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
