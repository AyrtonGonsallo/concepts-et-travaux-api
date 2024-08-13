// models/DevisPiece.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
const Piece = require('./Piece');
const Utilisateur = require('./Utilisateur');
const DevisTache = require('./DevisTache');

const DevisPiece = sequelize.define('DevisPiece', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID'
  },
  Username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Username'
  },
  AdresseIP: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'AdresseIP'
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'Date'
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Commentaire'
  },
  PieceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Piece,
      key: 'ID'
    },
    field: 'PieceID'
  },
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Prix'
  },  
  Payed: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'Payed'
  },
  UtilisateurID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Utilisateur,
      key: 'ID'
    },
    field: 'UtilisateurID'
  },
  DeviceID: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'DeviceID'
  },
}, {
  tableName: 'DevisPiece',
  timestamps: false
});
DevisPiece.hasMany(DevisTache, { foreignKey: 'DevisPieceID' });
DevisPiece.belongsTo(Piece, { foreignKey: 'PieceID' });
DevisPiece.belongsTo(Utilisateur, { foreignKey: 'UtilisateurID' });

module.exports = DevisPiece;
