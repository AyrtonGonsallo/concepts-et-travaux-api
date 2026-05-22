const { Sequelize, DataTypes } = require('sequelize');
const Style=require('./Style');
const Piece=require('./Piece');


const sequelize = require('./config/database');
const Galerie = sequelize.define('Galerie', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données

  },
  Type: { 
    type: DataTypes.ENUM('Réalisation','Proposition',), 
    allowNull: false 
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
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'cover_image' // Spécifie explicitement le nom de la colonne dans la base de données
  },
   

}, {
  tableName: 'Galerie',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});



module.exports = Galerie;
