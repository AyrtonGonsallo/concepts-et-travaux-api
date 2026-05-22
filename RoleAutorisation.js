const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = require('./config/database');
class RoleAutorisation extends Model {}

RoleAutorisation.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  RoleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Role', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    }
  },
  AutorisationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Autorisation', // Nom de la table associée dans la base de données
      key: 'Id' // Nom de la clé primaire dans la table associée
    }
  }
}, {
  sequelize,
  tableName: 'RoleAutorisation',
  timestamps: false
});

module.exports = RoleAutorisation;
