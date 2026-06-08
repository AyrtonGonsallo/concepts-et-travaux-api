const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Parametre = sequelize.define('Parametre', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Nom: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'Nom' // Specifies the column name explicitly
  },
  Valeur: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Valeur' // Specifies the column name explicitly
  },
  ValeurTexte: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'ValeurTexte' // Specifies the column name explicitly
  },
  Type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  
}, {
  tableName: 'Parametre',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Parametre;
