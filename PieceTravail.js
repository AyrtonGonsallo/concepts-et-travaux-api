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
class PieceTravail extends Model {}

PieceTravail.init({

    PieceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Piece', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    },
    TravailID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Travail', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    }
}, {
  sequelize,
  tableName: 'PieceTravail',
  timestamps: false
});

module.exports = PieceTravail;
