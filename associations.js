const Galerie = require('./Galerie');
const Style = require('./Style');
const Piece = require('./Piece');
const Image = require('./Image');

Galerie.belongsToMany(Style, {
  through: 'GalerieStyle',
  foreignKey: 'galerie_id',
  otherKey: 'style_id'
});

Style.belongsToMany(Galerie, {
  through: 'GalerieStyle',
  foreignKey: 'style_id',
  otherKey: 'galerie_id'
});

Galerie.belongsToMany(Piece, {
  through: 'GaleriePiece',
  foreignKey: 'galerie_id',
  otherKey: 'piece_id'
});
// Définir la relation one-to-many avec la table Galerie
Image.belongsTo(Galerie, { foreignKey: 'GalerieID' });
Galerie.hasMany(Image, {
  foreignKey: 'GalerieID'
});
Piece.belongsToMany(Galerie, {
  through: 'GaleriePiece',
  foreignKey: 'piece_id',
  otherKey: 'galerie_id'
});

module.exports = {
  Galerie,
  Style,
  Piece
};