const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');
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