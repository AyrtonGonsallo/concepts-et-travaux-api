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
);
class DevisArtisan extends Model {}

DevisArtisan.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  artisan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Utilisateur', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    },
  },
  devis_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DevisPiece', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    },
  }
}, {
  sequelize,
  tableName: 'DevisArtisan',
  timestamps: false
});

module.exports = DevisArtisan;
