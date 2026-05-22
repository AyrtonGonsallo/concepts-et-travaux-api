const { Sequelize, DataTypes } = require('sequelize');

const sequelize = require('./config/database');
const Autorisation = sequelize.define('Autorisation', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  Explications: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  DateDeCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'Date de Creation' // Assurez-vous de spécifier le nom correct de la colonne tel qu'il est dans la base de données
  }
}, {
  tableName: 'Autorisation',
  timestamps: false
});

module.exports = Autorisation;
