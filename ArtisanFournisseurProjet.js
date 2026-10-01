// User.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Utilisateur = require('./Utilisateur');
const DevisTache = require('./DevisTache');
const Projet = require('./Projet');



const ArtisanFournisseurProjet = sequelize.define('ArtisanFournisseurProjet', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  // l'artisan ou le fourniseur
   UtilisateurID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Utilisateur,
      key: 'Id'
    }
  },
  ProjetID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Projet,
      key: 'Id'
    }
  },
  DevistacheID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DevisTache,
      key: 'Id'
    }
  },
  Montant: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Montant'
  },
  NatureDesTravaux: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'NatureDesTravaux' // Nom de la colonne dans la table
  },
  AvisClients: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  RespectDesDelais: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  RespectDuPrix: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  QualiteDesTravaux: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TenueDuChantier: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Token: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: null,
    field: 'Token' // Specifies the column name explicitly
  },
  




}, {
  tableName: 'ArtisanFournisseurProjet',
  timestamps: false
});

// Définissez la relation many-to-one avec le modèle Role
ArtisanFournisseurProjet.belongsTo(Utilisateur, { foreignKey: 'UtilisateurID' });
ArtisanFournisseurProjet.belongsTo(Projet, { foreignKey: 'ProjetID' });
ArtisanFournisseurProjet.belongsTo(DevisTache, { foreignKey: 'DevistacheID' });
module.exports = ArtisanFournisseurProjet;
