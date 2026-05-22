const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const CategoriePiece = sequelize.define('CategoriePiece', {
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
  }
}, {
  tableName: 'Categorie_piece',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = CategoriePiece;
