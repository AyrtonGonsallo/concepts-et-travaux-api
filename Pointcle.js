const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Pointcle = sequelize.define('Pointcle', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Pointcle',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});


module.exports = Pointcle;
