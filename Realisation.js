const { Sequelize, DataTypes } = require('sequelize');
const BesoinProjet=require('./Besoin_projet');
const EtapeProjet=require('./Etape_projet');
const Galerie=require('./Galerie');
const Piece=require('./Piece');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

const Realisation = sequelize.define('Realisation', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Titre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Titre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Superficie: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Superficie' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'Prix' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Image_principale: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'Image_principale' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Duree: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'en jours',
    field: 'Duree' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Top: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'Top' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  GalerieID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Galerie,
      key: 'ID'
    },
    field: 'GalerieID' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  PieceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Piece,
      key: 'ID'
    },
    field: 'PieceID' // Spécifie explicitement le nom de la colonne dans la base de données
  }
}, {
  tableName: 'Realisation',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

Realisation.belongsToMany(EtapeProjet, { through: 'EtapeProjetRealisation',  
  foreignKey: 
    {
      name: 'RealisationID',
      field: 'RealisationID'
  }, 
  otherKey: {
    name: 'EtapeProjetID',
    field: 'EtapeProjetID'
}, 
   });

Realisation.belongsToMany(BesoinProjet, { through: 'BesoinProjetRealisation', 
  foreignKey:  {
    name: 'RealisationID',
    field: 'RealisationID'
}, 
  otherKey: {
    name: 'BesoinProjetID',
    field: 'BesoinProjetID'
}, 
});

Realisation.belongsTo(Galerie, { foreignKey: 'GalerieID' });
Realisation.belongsTo(Piece, { foreignKey: 'PieceID' });
module.exports = Realisation;
