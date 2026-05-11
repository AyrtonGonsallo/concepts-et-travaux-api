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
);
const Avis = sequelize.define('Avis', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données

  },
  Utilisateur: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Utilisateur' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Message' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Avis',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Avis;