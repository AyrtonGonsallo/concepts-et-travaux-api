
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
const Utilisateur = require('./Utilisateur');

// Définition des valeurs possibles pour le champ Status
const statusValues = [
    'devis en cours',
    'devis à finaliser',
    'devis à valider',
    'travaux à démarrer',
    'travaux en cours',
    'travaux achevés',
    'chantier réceptionné'
  ];

const Projet = sequelize.define('Projet', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    Nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Date_de_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'Date de création'	
    },
    Status: {
        type: DataTypes.ENUM, // Utilisation du type ENUM
        values: statusValues, // Définition des valeurs possibles
        allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    User_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateur', // Assumes you have a Users table
        key: 'Id'
      }
    }
  }, {
    tableName: 'Projet',
    timestamps: false,
    underscored: true // Converts camelCase to snake_case
  });
  
  Projet.belongsTo(Utilisateur, { foreignKey: 'User_id', as: 'Utilisateur' });
  module.exports = Projet;