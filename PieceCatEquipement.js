const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = require('./config/database');
class PieceCatEquipement extends Model {}

PieceCatEquipement.init({

    PieceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Piece', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    },
    CatEquipementID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Equipement', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    }
}, {
  sequelize,
  tableName: 'PieceCatEquipement',
  timestamps: false
});

module.exports = PieceCatEquipement;
