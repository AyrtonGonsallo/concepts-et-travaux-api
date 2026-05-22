// Grade.js

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = require('./config/database');//const User = require('./User');
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
  