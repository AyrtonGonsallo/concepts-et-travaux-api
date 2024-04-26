const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Autorisation = sequelize.define('Autorisation', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  Explications: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  DateDeCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'Date de Creation' // Assurez-vous de spécifier le nom correct de la colonne tel qu'il est dans la base de données
  }
}, {
  tableName: 'Autorisation',
  timestamps: false
});

module.exports = Autorisation;
