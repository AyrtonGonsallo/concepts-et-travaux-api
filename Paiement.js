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
);const Projet = require('./Projet');

const Paiement = sequelize.define('Paiement', {
  ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TypeDePaiement: { 
    type: DataTypes.ENUM('virement', 'en ligne'), 
    allowNull: true 
  },
  Titre: {
        type: DataTypes.STRING,
        allowNull: true
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Type: { 
    type: DataTypes.ENUM('visite','acompte', 'échéance', 'solde final'), 
    allowNull: false 
  },
  Requette: { 
    type: DataTypes.ENUM('demande','reglement'), 
    allowNull: false 
  },
  Montant: { 
    type: DataTypes.DOUBLE, 
    allowNull: false 
  },
  Lien: {
        type: DataTypes.STRING,
        allowNull: true
  },
  ReferenceVirement: {
        type: DataTypes.STRING,
        allowNull: true
  },
  Status: { 
      type: DataTypes.BOOLEAN, 
      allowNull: true, 
      defaultValue: true 
    },
  Date: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  DatedePaiement: { 
    type: DataTypes.DATE, 
    allowNull: true, 
  },
  ProjetID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ProjetID'
  },
}, 
{ tableName: 'Paiement',
  timestamps: false 
}
);


Paiement.belongsTo(Projet, { foreignKey: 'ProjetID' });
module.exports = Paiement;