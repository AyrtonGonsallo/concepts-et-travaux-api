// models/DevisTache.js

const { Sequelize, DataTypes } = require('sequelize');
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
);const DevisPiece = require('./DevisPiece');
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
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Prix'
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
