// Grade.js

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
//const User = require('./User');
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
  