// Grade.js

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
);//const User = require('./User');
const Grade = sequelize.define('Grade', {
    // Définissez les attributs de votre modèle ici
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    day: {
        type: DataTypes.DATE,
        allowNull: false
      },
      checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Par défaut, la valeur de "checked" est false
      }
    }, 
    {
        tableName: 'Grade', // Spécifiez le nom de la table ici
        timestamps: false // Désactivez l'ajout automatique des champs createdAt et updatedAt
    });
//Grade.belongsTo(User); // Définit la relation many-to-one
  module.exports = Grade;
  