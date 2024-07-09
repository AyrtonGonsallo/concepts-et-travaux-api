const { Sequelize, DataTypes } = require('sequelize');
const Equipement=require('./Equipement');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const ModeleEquipement = sequelize.define('ModeleEquipement', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Titre'
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description'
  },
  Image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Image'
  },
  Longeur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Longeur'
  },
  Largeur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Largeur'
  },
  Hauteur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Hauteur'
  },
  Epaisseur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Epaisseur'
  },
  Matiere: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Matiere'
  },
  EquipementID: {
    type: DataTypes.INTEGER,
    allowNull: false,
   
    field: 'EquipementID' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'ModeleEquipement',
  timestamps: false,
  underscored: true, // Utiliser les noms de colonnes en snake_case
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ModeleEquipement;
