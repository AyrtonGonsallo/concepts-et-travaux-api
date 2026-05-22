const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

const EtapeProjetRealisation = sequelize.define('EtapeProjetRealisation', {
    EtapeProjetID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
      references: {
        model: 'EtapeProjet', // Modèle du Etape de projet
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
    tableName: 'EtapeProjetRealisation',
    timestamps: false
  });
  
  module.exports = EtapeProjetRealisation;