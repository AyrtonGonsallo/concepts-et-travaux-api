const { Sequelize, DataTypes } = require('sequelize');
const Utilisateur = require('./Utilisateur');
const sequelize = require('./config/database');
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
  Etape: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Etape' // Specifies the column name explicitly
  },
  Image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Image'
  },
  PrixFournisseur: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'PrixFournisseur'
  },  
  PrixPose: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'PrixPose'
  },  
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Prix'
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
  NombreDeVasques: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'NombreDeVasques'
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
  },
  ActiverFournisseur: { 
    type: DataTypes.BOOLEAN, 
    field: 'ActiverFournisseur', // Specifies the column name explicitly
    defaultValue: false,
    allowNull: true,
  },
  FournisseurID: {
    type: DataTypes.INTEGER,
    field: 'FournisseurID', // Specifies the column name explicitly
    allowNull: true,
  },
  ArtisanID: {
    type: DataTypes.INTEGER,
    field: 'ArtisanID', // Specifies the column name explicitly
    allowNull: true,
  },
  ModeleDeReferenceID: {
    type: DataTypes.INTEGER,
    field: 'ModeleDeReferenceID', // Specifies the column name explicitly
    allowNull: true,
  },
}, {
  tableName: 'ModeleEquipement',
  timestamps: false,
  underscored: true, // Utiliser les noms de colonnes en snake_case
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

ModeleEquipement.belongsTo(Utilisateur, { foreignKey: 'FournisseurID',as: 'Fournisseur', });
ModeleEquipement.belongsTo(Utilisateur, { foreignKey: 'ArtisanID',as: 'Artisan', });
module.exports = ModeleEquipement;
