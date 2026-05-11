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
const Parametre = sequelize.define('Parametre', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Nom: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'Nom' // Specifies the column name explicitly
  },
  Valeur: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'Valeur' // Specifies the column name explicitly
  },
  Type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  
}, {
  tableName: 'Parametre',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Parametre;
