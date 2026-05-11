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

const PointcleRealisation = sequelize.define('PointcleRealisation', {
  PointcleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
      references: {
        model: 'Pointcle', // Modèle du Etape de projet
        key: 'ID'
      }
    },
    RealisationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Realisation', // Modèle de la réalisation
        key: 'ID'
      }
    }
  }, {
    tableName: 'PointcleRealisation',
    timestamps: false
  });
  
  module.exports = PointcleRealisation;