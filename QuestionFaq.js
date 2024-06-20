const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
const CategorieQuestionFaq=require('./CategorieQuestionFaq')


const QuestionFaq = sequelize.define('QuestionFaq', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Titre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    Question: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Reponse: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'QuestionFaq',
    timestamps: false
  });

  QuestionFaq.belongsToMany(CategorieQuestionFaq, { through: 'Question_Categorie', 
    foreignKey:  {
      name: 'QuestionID',
      field: 'QuestionID'
  }, 
    otherKey: {
      name: 'CategorieID',
      field: 'CategorieID'
  }, 
  });
  module.exports = QuestionFaq;
  