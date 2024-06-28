const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Avis = sequelize.define('Avis', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données

  },
  Utilisateur: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Utilisateur' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Message' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Avis',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Avis;