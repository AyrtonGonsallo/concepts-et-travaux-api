const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);
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