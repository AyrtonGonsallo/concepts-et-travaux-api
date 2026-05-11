const { Sequelize, DataTypes } = require('sequelize');
const PieceTravail = require('./PieceTravail');
const Piece = require('./Piece');
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
