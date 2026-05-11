const { Sequelize, DataTypes } = require('sequelize');
const CategoriePiece=require('./Categorie_piece');
const Galerie=require('./Galerie');
const PieceCategorie=require('./PieceCategorie');
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
  GalerieID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Galerie,
      key: 'ID'
    },
    field: 'GalerieID' // Spécifie explicitement le nom de la colonne dans la base de données
  }
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
Piece.belongsTo(Galerie, { foreignKey: 'GalerieID' });

module.exports = Piece;
