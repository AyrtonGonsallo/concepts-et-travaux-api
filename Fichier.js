const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const Projet = require('./Projet');

const Fichier = sequelize.define('Fichier', {
  ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nom: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Nom' 
  },
  Url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Url' 
  },
  DateDeCreation: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  Type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  ProjetID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ProjetID'
  },
}, 
{ tableName: 'Fichier',
  timestamps: false 
}
);

Fichier.belongsTo(Projet, { foreignKey: 'ProjetID', as: 'Projet' });
module.exports = Fichier;
