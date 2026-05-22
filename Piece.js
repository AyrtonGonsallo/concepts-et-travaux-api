const { Sequelize, DataTypes } = require('sequelize');
const CategoriePiece=require('./Categorie_piece');
const Galerie=require('./Galerie');
const PieceCategorie=require('./PieceCategorie');

const sequelize = require('./config/database');

const Piece = sequelize.define('Piece', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Image_principale: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Image_principale' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Image_presentation: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Image_presentation' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Présentation: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Présentation' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
}, {
  tableName: 'Piece',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Piece.belongsToMany(CategoriePiece, { through: PieceCategorie, foreignKey: {
  name: 'PieceID',
  field: 'PieceID'
} });

module.exports = Piece;
