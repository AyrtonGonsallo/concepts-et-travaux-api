const { Sequelize, DataTypes } = require('sequelize');
const CategoriePiece=require('./Categorie_piece');
const Galerie=require('./Galerie');
const PieceCategorie=require('./PieceCategorie');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
