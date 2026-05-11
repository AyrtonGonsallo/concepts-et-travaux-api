
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
);const Utilisateur = require('./Utilisateur');
const Visite = require('./Visite');

// Définition des valeurs possibles pour le champ Status
const statusValues = [
    'visite à régler',
    'visite réglée',
    'visite programmée',
    'projet validé',
    'paiement autorisé',
    'acompte payé',
    'travaux démarrés',
    'travaux en cours',
    'travaux achevés',
    'travaux livrés',
    'gpa terminé'
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
    Date_de_debut_des_travaux: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Date_de_debut_des_travaux'	
    },
    Date_de_fin_des_travaux: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Date_de_fin_des_travaux'	
    },
    Date_de_fin_gpa: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Date_de_fin_gpa'	
    },
    Date_de_validation: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Date_de_validation'	
    },
    Date_de_paiement_acompte: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'Date_de_paiement_acompte'	
    },
    Status: {
        type: DataTypes.ENUM, // Utilisation du type ENUM
        values: statusValues, // Définition des valeurs possibles
        allowNull: false
    },
    Valider: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false, 
      defaultValue: false 
    },
    ProgressionTravaux: { 
      type: DataTypes.DOUBLE,
      allowNull: true,
      field: 'ProgressionTravaux'
    },
    VisiteFaite: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0, field: 'VisiteFaite'	 },
    Payed: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      field: 'Payed'
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
    },
    Client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateur', // Assumes you have a Users table
          key: 'Id'
        }
      },
    VisiteID: { type: DataTypes.INTEGER, allowNull: true, field: 'VisiteID'	 },
    DeviceID: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'DeviceID'
      },
  }, {
    tableName: 'Projet',
    timestamps: false,
    underscored: true // Converts camelCase to snake_case
  });
  
  Projet.belongsTo(Utilisateur, { foreignKey: 'User_id', as: 'Utilisateur' });
  Projet.belongsTo(Utilisateur, { foreignKey: 'Client_id', as: 'Client' });
  Projet.belongsTo(Visite, { foreignKey: 'VisiteID' });
 

module.exports = Projet;