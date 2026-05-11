// models/DevisTacheHistorique.js

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
);const DevisTache = require('./DevisTache');

const DevisTacheHistorique = sequelize.define('DevisTacheHistorique', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID'
  },
  TacheID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DevisTache,
      key: 'ID'
    },
    field: 'TacheID'
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'Date'
  },
  Donnees: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'Donnees'
  }
}, {
  tableName: 'DevisTacheHistorique',
  timestamps: false
});


DevisTacheHistorique.belongsTo(DevisTache, { foreignKey: 'TacheID' });

module.exports = DevisTacheHistorique;
