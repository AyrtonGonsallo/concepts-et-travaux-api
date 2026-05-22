const { Sequelize, DataTypes } = require('sequelize');
const Autorisation = require('./Autorisation');
const sequelize = require('./config/database');
const Role = sequelize.define('Role', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Role',
  timestamps: false
});
Role.belongsToMany(Autorisation, { through: 'RoleAutorisation', foreignKey: 'RoleId' ,  timestamps: false // Ajoutez cette option pour désactiver la gestion automatique des horodatages dans la table de liaison
});


module.exports = Role;
