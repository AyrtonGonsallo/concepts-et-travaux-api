const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

class ProjetArtisan extends Model {}

ProjetArtisan.init({
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
  tableName: 'ProjetArtisan',
  timestamps: false
});

module.exports = ProjetArtisan;
