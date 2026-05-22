// models/DevisTacheHistorique.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const DevisTache = require('./DevisTache');

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
