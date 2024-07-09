const { Sequelize, DataTypes } = require('sequelize');
const Piece=require('./Piece');
const ModeleEquipement=require('./ModeleEquipement');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Equipement = sequelize.define('Equipement', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Image: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'Image' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Type: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Type' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  PieceID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Piece,
      key: 'ID'
    },
    field: 'PieceID' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Equipement',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Equipement.belongsTo(Piece, { foreignKey: 'PieceID' });
Equipement.hasMany(ModeleEquipement, { foreignKey: 'EquipementID' });
module.exports = Equipement;
