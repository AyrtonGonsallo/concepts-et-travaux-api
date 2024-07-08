const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
