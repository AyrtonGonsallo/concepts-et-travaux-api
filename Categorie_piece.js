const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
