const { Sequelize, DataTypes } = require('sequelize');
const Galerie=require('./Galerie');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Image = sequelize.define('Image', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données

  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données

  },
  Url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Url' // Spécifie explicitement le nom de la colonne dans la base de données

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
  tableName: 'Image',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

// Définir la relation one-to-many avec la table Galerie
Image.belongsTo(Galerie, { foreignKey: 'GalerieID' });

module.exports = Image;
