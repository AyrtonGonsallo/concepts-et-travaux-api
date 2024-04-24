// User.js

const { Sequelize, DataTypes } = require('sequelize');
const Grade = require('./Grade'); // Importez le modèle Grade
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
