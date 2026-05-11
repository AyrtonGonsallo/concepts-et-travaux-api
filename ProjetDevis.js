const { Sequelize, DataTypes,Model } = require('sequelize');
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
const DevisPiece = require('./DevisPiece');

class ProjetDevis extends Model {}

ProjetDevis.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  devis_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DevisPiece', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    },
  },
  projet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projet', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    },
  }
}, {
  sequelize,
  tableName: 'ProjetDevis',
  timestamps: false
});

Projet.belongsToMany(DevisPiece, {
  through: ProjetDevis,
  foreignKey: 'projet_id',
  otherKey: 'devis_id'
});

DevisPiece.belongsToMany(Projet, {
  through: ProjetDevis,
  foreignKey: 'devis_id',
  otherKey: 'projet_id'
});

module.exports = ProjetDevis;
