const { Sequelize, DataTypes } = require('sequelize');
const Piece=require('./Piece');
const ModeleEquipement=require('./ModeleEquipement');
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
const Equipement = sequelize.define('Equipement', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Image: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Image' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Type: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Type' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  AfficherLongueur: {
    type: DataTypes.BOOLEAN, // TINYINT(1) for boolean-like values
    allowNull: false,
    defaultValue: false,  // Default value as false
    field: 'AfficherLongueur'
  },
  AfficherLargeur: {
    type: DataTypes.BOOLEAN, // TINYINT(1) for boolean-like values
    allowNull: false,
    defaultValue: false,  // Default value as false
    field: 'AfficherLargeur'
  },
  AfficherVasque: {
    type: DataTypes.BOOLEAN, // TINYINT(1) for boolean-like values
    allowNull: false,
    defaultValue: false,  // Default value as false
    field: 'AfficherVasque'
  },
  AfficherEncastreeApparente: {
    type: DataTypes.BOOLEAN, // TINYINT(1) for boolean-like values
    allowNull: false,
    defaultValue: false,  // Default value as false
    field: 'AfficherEncastreeApparente'
  },
  
  PieceID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Piece,
      key: 'ID'
    },
    field: 'PieceID' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Equipement',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Equipement.belongsTo(Piece, { foreignKey: 'PieceID' });
Equipement.hasMany(ModeleEquipement, {
  foreignKey: 'EquipementID',
  as: 'Modeles'
});

ModeleEquipement.belongsTo(Equipement, {
  foreignKey: 'EquipementID',
  as: 'Equipement'
});

module.exports = Equipement;
