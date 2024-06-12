const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');


const BesoinProjetRealisation = sequelize.define('BesoinProjetRealisation', {
    BesoinProjetID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      
      references: {
        model: 'BesoinProjet', // Modèle du besoin de projet
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
    tableName: 'BesoinProjetRealisation',
    timestamps: false
    
  });
  
  module.exports = BesoinProjetRealisation;