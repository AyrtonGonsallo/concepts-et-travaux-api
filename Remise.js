const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const DevisPiece = require('./DevisPiece');

const Remise = sequelize.define('Remise', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Titre' // Specifies the column name explicitly
  },
  Type: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  Pourcentage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'Pourcentage' // Specifies the column name explicitly
  },
  Valeur: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Valeur' // Specifies the column name explicitly
  },
  DevisID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'DevisID'
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Commentaire'
  },
  
  
  
}, {
  tableName: 'Remise',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Remise.belongsTo(DevisPiece, { foreignKey: 'DevisID' });
module.exports = Remise;
