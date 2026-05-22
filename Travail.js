const { Sequelize, DataTypes } = require('sequelize');
const PieceTravail = require('./PieceTravail');
const Piece = require('./Piece');
const sequelize = require('./config/database');
const Travail = sequelize.define('Travail', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Valide: {
    type: DataTypes.BOOLEAN, // TINYINT(1) for boolean-like values
    allowNull: false,
    defaultValue: false,  // Default value as false
    field: 'Valide'
  }
  
}, {
  tableName: 'Travail',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Travail.belongsToMany(Piece, { through: PieceTravail, foreignKey: {
    name: 'TravailID',
    field: 'TravailID'
  } });
module.exports = Travail;
