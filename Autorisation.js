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
