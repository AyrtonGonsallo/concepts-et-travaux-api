const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = require('./config/database');
class PieceCategorie extends Model {}

PieceCategorie.init({

    PieceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Piece', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    },
    CategoriePieceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'CategoriePiece', // Nom de la table associée dans la base de données
        key: 'ID' // Nom de la clé primaire dans la table associée
        },
    }
}, {
  sequelize,
  tableName: 'PieceCategorie',
  timestamps: false
});

module.exports = PieceCategorie;
