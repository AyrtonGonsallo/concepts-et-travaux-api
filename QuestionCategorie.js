const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const QuestionCategorie = sequelize.define('Question_Categorie', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    QuestionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'QuestionFaq',
        key: 'ID'
      }
    },
    CategorieID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CategorieQuestionFaq',
        key: 'ID'
      }
    }
  }, {
    tableName: 'Question_Categorie',
    timestamps: false
  });
  
  module.exports = QuestionCategorie;