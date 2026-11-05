const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
const Visite = sequelize.define('Visite', {
  ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Date: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  DateDeProgrammation: { 
    type: DataTypes.DATE, 
    allowNull: true, 
  },
  DateVisiteFaite: { 
    type: DataTypes.DATE, 
    allowNull: true, 
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Lien_compte_rendu: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Lien_compte_rendu' // Specifies the column name explicitly
  },
  Paye: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  },
  Faite: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  }
}, 
{ tableName: 'Visite',
  timestamps: false 
}
);

module.exports = Visite;
