const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const CategorieQuestionFaq=require('./CategorieQuestionFaq')


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
  