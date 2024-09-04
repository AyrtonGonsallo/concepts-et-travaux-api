const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Gamme = sequelize.define('Gamme', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
  },
  Type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Type' // Specifies the column name explicitly
  },
  Label: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Label' // Specifies the column name explicitly
  },
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    field: 'Prix' // Specifies the column name explicitly
  },
  Image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Image' // Specifies the column name explicitly
  },
  Pdf: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'Pdf' // Specifies the column name explicitly
  },
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'TravailID' // Specifies the column name explicitly
  }
}, {
  tableName: 'Gamme',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Gamme;
