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
const Tva = sequelize.define('Tva', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Valeur: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'Valeur' // Specifies the column name explicitly
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Commentaire' // Specifies the column name explicitly
  },
  Defaut: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'Defaut'
  },
  
}, {
  tableName: 'Tva',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Tva;
