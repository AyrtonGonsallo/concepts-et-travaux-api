const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');


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