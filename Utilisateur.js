// User.js

const { Sequelize, DataTypes } = require('sequelize');
const Role = require('./Role');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Utilisateur = sequelize.define('Utilisateur', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  // Ajoutez la nouvelle colonne Date de Création
  DateDeCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'Date de Création',
    defaultValue: DataTypes.NOW
  },
  RaisonSociale: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'Raison Sociale' // Nom de la colonne dans la table
  },
  NumeroSIRET: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'Numéro de SIRET' // Nom de la colonne dans la table
  },
  Nom: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'Prénom'
  },
  Email: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Telephone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Téléphone'
  },
  AdressePostale: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'Adresse Postale' // Nom de la colonne dans la table
  },
  CodePostal: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'CodePostal' // Nom de la colonne dans la table
  },
  CommunePostale: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'CommunePostale' // Nom de la colonne dans la table
  },
  Activite: {
    type: DataTypes.STRING(255),
    field: 'Activité'
  },
  CA: {
    type: DataTypes.FLOAT
  },
  Effectif: {
    type: DataTypes.INTEGER
  },
  References: {
    type: DataTypes.TEXT,
    field: 'références' // Nom de la colonne dans la table
  },
  QuestionnaireTarif: {
    type: DataTypes.TEXT,
    field: 'Questionnaire de tarif' // Nom de la colonne dans la table
  },
  AssuranceRCDecennale: {
    type: DataTypes.STRING(255),
    field: 'Assurance RC Décennale' // Nom de la colonne dans la table
  },
  KBis: {
    type: DataTypes.STRING(255)
  },
  DeviceID: {
    type: DataTypes.STRING(255)
  },
  // Ajoutez une clé étrangère vers le modèle Role
  RoleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role,
      key: 'Id'
    }
  }
}, {
  tableName: 'Utilisateur',
  timestamps: false
});

// Définissez la relation many-to-one avec le modèle Role
Utilisateur.belongsTo(Role, { foreignKey: 'RoleId' });
module.exports = Utilisateur;
