const { Sequelize, DataTypes } = require('sequelize');
const BesoinProjet=require('./Besoin_projet');
const EtapeProjet=require('./Etape_projet');
const Galerie=require('./Galerie');
const Piece=require('./Piece');
const Pointcle=require('./Pointcle');
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
  SousTitre: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'SousTitre' // Spécifie explicitement le nom de la colonne dans la base de données
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

Realisation.belongsToMany(Pointcle, { through: 'PointcleRealisation', 
  foreignKey:  {
    name: 'RealisationID',
    field: 'RealisationID'
}, 
  otherKey: {
    name: 'PointcleID',
    field: 'PointcleID'
}, 
});

Realisation.belongsTo(Galerie, { foreignKey: 'GalerieID' });
Realisation.belongsTo(Piece, { foreignKey: 'PieceID' });
module.exports = Realisation;
