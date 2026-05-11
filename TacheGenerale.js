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
const TacheGenerale = sequelize.define('TacheGenerale', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  
  Label: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Label' // Specifies the column name explicitly
  },
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'Prix' // Specifies the column name explicitly
  },
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'TravailID' // Specifies the column name explicitly
  }
}, {
  tableName: 'TacheGenerale',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = TacheGenerale;
