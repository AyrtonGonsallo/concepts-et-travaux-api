// models/DevisTache.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
const DevisPiece = require('./DevisPiece');
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
