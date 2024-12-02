const { Sequelize, DataTypes } = require('sequelize');
const Travail = require('./Travail');
const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
const etapeValues = [
  'Choix de la pièce',
  'Travaux',
  'Dimensions',
  'Etat de surfaces',
  'Gamme de produits',
  'Recapitulatif',
  'Finalisation'
];


const EtapeDevis = sequelize.define('EtapeDevis', {
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
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_chambre: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_chambre' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_sdb: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_sdb' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_salon: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_salon' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_cuisine: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_cuisine' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_wc: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_wc' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  Description_salle_manger: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Description_salle_manger' // Spécifie explicitement le nom de la colonne dans la base de données
  },
  TravailID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Travail,
      key: 'ID'
    },
    field: 'TravailID'
  },
  Etape: {
    type: DataTypes.ENUM, // Utilisation du type ENUM
    values: etapeValues, // Définition des valeurs possibles
    allowNull: false
},
}, {
  tableName: 'Etape_devis',
  timestamps: false,
  underscored: true,
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

EtapeDevis.belongsTo(Travail, { foreignKey: 'TravailID' });
module.exports = EtapeDevis;
