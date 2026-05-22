// models/DevisPiece.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');const Piece = require('./Piece');
const Utilisateur = require('./Utilisateur');
const Tva = require('./Tva');
const DevisTache = require('./DevisTache');
const Projet = require('./Projet');


const DevisPiece = sequelize.define('DevisPiece', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'ID'
  },
  Titre: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'Titre'
  },
  Username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Username'
  },
  AdresseIP: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'AdresseIP'
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'Date'
  },
  Commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'Commentaire'
  },
  PieceID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Piece,
      key: 'ID'
    },
    field: 'PieceID'
  },
   TvaID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tva,
      key: 'ID'
    },
    field: 'TvaID'
  },
  Prix: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    field: 'Prix'
  },  
  UtilisateurID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Utilisateur,
      key: 'ID'
    },
    field: 'UtilisateurID'
  },
  
}, {
  tableName: 'DevisPiece',
  timestamps: false
});
DevisPiece.hasMany(DevisTache, { foreignKey: 'DevisPieceID' });
DevisPiece.belongsTo(Piece, { foreignKey: 'PieceID' });
DevisPiece.belongsTo(Tva, { foreignKey: 'TvaID' });
DevisPiece.belongsTo(Utilisateur, { foreignKey: 'UtilisateurID' });
DevisPiece.belongsToMany(Projet, {
  through: 'ProjetDevis',
  foreignKey: 'devis_id',
  otherKey: 'projet_id',
  as: 'Projets',
  timestamps: false
});
Projet.belongsToMany(DevisPiece, { through: 'ProjetDevis', foreignKey: 'projet_id' ,otherKey: 'devis_id', as: 'Devis',  timestamps: false})
 DevisPiece.belongsToMany(Utilisateur, { through: 'DevisArtisan', foreignKey: 'devis_id' ,otherKey: 'artisan_id', as: 'Artisans',  timestamps: false // Ajoutez cette option pour désactiver la gestion automatique des horodatages dans la table de liaison
    }
);
module.exports = DevisPiece;
