const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const TacheGenerale = sequelize.define('TacheGenerale', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Specifies the column name explicitly
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
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'TravailID' // Specifies the column name explicitly
  }
}, {
  tableName: 'TacheGenerale',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = TacheGenerale;
