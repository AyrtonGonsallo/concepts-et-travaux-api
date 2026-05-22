const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

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