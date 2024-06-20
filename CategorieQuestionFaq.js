const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const CategorieQuestionFaq = sequelize.define('CategorieQuestionFaq', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Titre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'CategorieQuestionFaq',
  timestamps: false
});


module.exports = CategorieQuestionFaq;