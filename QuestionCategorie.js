const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
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