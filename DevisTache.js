// models/DevisTache.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const DevisPiece = require('./DevisPiece');
const Travail = require('./Travail');

const DevisTache = sequelize.define('DevisTache', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID'
  },
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Travail,
      key: 'ID'
    },
    field: 'TravailID'
  },
  DevisPieceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'DevisPieceID'
  },
  TravailSlug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'TravailSlug'
  },
  Commentaires: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Commentaires'
  },
  Prix: {//Prix de vente remisé HT = prix deboursé HT - remise
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Prix'
  },
  PrixDeVenteRemiseHT: {//Prix de vente remisé HT = prix deboursé HT - remise
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'PrixDeVenteRemiseHT'
  },
  
  PrixCoutant: {//Prix Coûtant HT =  somme des taches avec tarifs artisans
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'PrixCoutant'
  },
  PrixDebourseHT: {//Prix déboursé HT =  somme des taches
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'PrixDebourseHT'
  },
  PrixDeVenteHT: {//Prix de vente HT =  Prix de vente remisé HT  x coef
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'PrixDeVenteHT'
  },
  PrixDeVenteRemiseTTC: {//Prix de vente remisé TTC = Prix de vente HT  + tva
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'PrixDeVenteRemiseTTC'
  },
  Donnees: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'Donnees'
  }
}, {
  tableName: 'DevisTache',
  timestamps: false
});


DevisTache.belongsTo(Travail, { foreignKey: 'TravailID' });

module.exports = DevisTache;
