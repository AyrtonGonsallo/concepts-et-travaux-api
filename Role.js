const { Sequelize, DataTypes } = require('sequelize');
const Autorisation = require('./Autorisation');
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
