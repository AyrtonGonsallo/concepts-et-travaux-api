const { Sequelize, DataTypes } = require('sequelize');
const Galerie=require('./Galerie');


const sequelize = require('./config/database');
const Style = sequelize.define('Style', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
}, {
  tableName: 'Style',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});





module.exports = Style;
