const { Sequelize, DataTypes,Model } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

class Recuperation extends Model {}

Recuperation.init({
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  ExpirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  }
}, {
  sequelize,
  tableName: 'Recuperation',
  timestamps: false
});

module.exports = Recuperation;
