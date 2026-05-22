const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const Utilisateur = require('./Utilisateur');

const Gamme = sequelize.define('Gamme', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  Label: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Label' // Specifies the column name explicitly
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
    allowNull: false,
    field: 'Prix' // Specifies the column name explicitly
  },
  Image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Image' // Specifies the column name explicitly
  },
  Pdf: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Pdf' // Specifies the column name explicitly
  },
  Etape: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Etape' // Specifies the column name explicitly
  },
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'TravailID' // Specifies the column name explicitly
  },
  Ordre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Ordre' // Specifies the column name explicitly
  },
  PrixMultiples: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'PrixMultiples'
  },
  ActiverPrixMultiples: { 
    type: DataTypes.BOOLEAN, 
    field: 'ActiverPrixMultiples', // Specifies the column name explicitly
    defaultValue: false,
    allowNull: true,
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
  GammeDeReferenceID: {
    type: DataTypes.INTEGER,
    field: 'GammeDeReferenceID', // Specifies the column name explicitly
    allowNull: true,
  },
}, {
  tableName: 'Gamme',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});


Gamme.belongsTo(Utilisateur, { foreignKey: 'FournisseurID',as: 'Fournisseur', });
module.exports = Gamme;
