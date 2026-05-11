// User.js

const { Sequelize, DataTypes } = require('sequelize');
const Grade = require('./Grade'); // Importez le modèle Grade
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
const User = sequelize.define('User', {
  // Définissez les attributs de votre modèle ici

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'User', // Spécifiez le nom de la table ici
  timestamps: false // Désactivez l'ajout automatique des champs createdAt et updatedAt
});

User.hasMany(Grade); // Définit la relation one-to-many

module.exports = User;
