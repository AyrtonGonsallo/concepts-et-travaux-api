const express = require('express');
const router = express.Router();

const Image = require('../Image')
const Galerie = require('../Galerie')
const Style = require('../Style')
const Piece = require('../Piece')
require('../associations');
const { Op } = require('sequelize');
require('dotenv').config();





// Endpoint POST pour ajouter une catégorie de piece
router.post('/ajouter_style', async (req, res) => {
  try {
    const { Titre } = req.body;
    // Création de la catégorie de projet dans la base de données
    const style = await Style.create({ Titre });
    res.status(201).json(style);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du style :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour supprimer une catégorie de pièce par son ID
router.delete('/delete_style/:id', async (req, res) => {
  try {
    const rowsDeleted = await Style.destroy({
      where: { ID: req.params.id }
    });
   
    res.status(200).json({ message: 'style supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du style :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.get('/get_all_styles', async (req, res) => {
  try {
    const styles = await Style.findAll({
      order: [['Titre', 'ASC']]
    });
    res.status(200).json(styles);
  } catch (error) {
    console.error('Erreur lors de la récupération des styles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de pièce par son ID
router.get('/get_style/:id', async (req, res) => {
  try {
    const style = await Style.findByPk(req.params.id);
    if (!style) {
      return res.status(404).json({ error: 'style non trouvé' });
    }
    res.status(200).json(style);
  } catch (error) {
    console.error('Erreur lors de la récupération du style:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour mettre à jour une catégorie de pièce
router.put('/update_style/:id', async (req, res) => {
  try {
    const { Titre} = req.body;
    const style = await Style.findByPk(req.params.id);
    if (!style) {
      return res.status(404).json({ error: 'style non trouvé' });
    }

    style.Titre = Titre || style.Titre;
    await style.save();

    res.status(200).json(style);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du style :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour ajouter une galerie
router.post('/add_galerie', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre
    });

    // Répondre avec la galerie ajoutée
    res.status(201).json(nouvelleGalerie);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la galerie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour ajouter une galerie avec des images
router.post('/add_galerie_with_images', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre,Type,Description,cover_image,pieces,styles, Images } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre,
       Type,
       Description,
       cover_image,
    });

    // Vérifier si des images sont fournies dans la requête
    if (Images && Images.length > 0) {
      // Créer les images associées à la galerie
      const nouvellesImages = await Promise.all(Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: nouvelleGalerie.ID // Associer l'image à la galerie créée
        });
      }));

      // Associer les nouvelles images à la galerie
      nouvelleGalerie.Images = nouvellesImages;
    }

    // =========================
    // STYLES MANY TO MANY
    // =========================

    if (Array.isArray(styles) && styles.length > 0) {

      await nouvelleGalerie.addStyles(styles);

    }

    // =========================
    // PIECES MANY TO MANY
    // =========================

    if (Array.isArray(pieces) && pieces.length > 0) {

      await nouvelleGalerie.addPieces(pieces);

    }

    // =========================
    // RELOAD COMPLET
    // =========================

    const galerieComplete = await Galerie.findByPk(
      nouvelleGalerie.ID,
      {
        include: [
          {
            model: Style
          },
          {
            model: Piece
          }
        ]
      }
    );

    const images = await Image.findAll({ where: { GalerieID: nouvelleGalerie.ID } });
    // Ajouter les images à la galerie
    galerieComplete.images = images;

    // Répondre avec la galerie ajoutée et ses images
    res.status(201).json(galerieComplete);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la galerie avec images :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.get('/get_galerie/:id', async (req, res) => {
  const galerieId = req.params.id;

  try {
    const galerie = await Galerie.findByPk(galerieId, {
      include: [
        // IMAGES
        {
          model: Image
        },
        // STYLES
        {
          model: Style,
          through: {
            attributes: []
          }
        },
        // PIECES
        {
          model: Piece,
          through: {
            attributes: []
          }
        }
      ]
    });

    if (!galerie) {
      return res.status(404).json({
        message: `Galerie avec l'ID ${galerieId} non trouvée`
      });
    }

    

    res.status(200).json(galerie);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




router.get('/get_nbr_galeries/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count, 10); // Récupérer le nombre de réalisations à renvoyer


    const galeries = await Galerie.findAll({
      include: [
        // IMAGES
        {
          model: Image
        },
        // STYLES
        {
          model: Style,
          through: {
            attributes: []
          }
        },
        // PIECES
        {
          model: Piece,
          through: {
            attributes: []
          }
        }
      ],
      limit: count // Limiter le nombre de résultats
    });

    

    res.status(200).json(galeries);
  } catch (error) {
    console.error('Erreur lors de la récupération des galeries :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer toutes les galeries avec leurs images
router.get('/get_galeries', async (req, res) => {
  try {
    // Récupérer toutes les galeries
    const galeries = await Galerie.findAll({
      include: [
        // IMAGES
        {
          model: Image
        },
        // STYLES
        {
          model: Style,
          through: {
            attributes: []
          }
        },
        // PIECES
        {
          model: Piece,
          through: {
            attributes: []
          }
        }
      ]
    });

    
    res.status(200).json(galeries);
  } catch (error) {
    console.error('Erreur lors de la récupération des galeries :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.get('/get_nbr_galeries/:maximun', async (req, res) => {
  try {
    const maximun = parseInt(req.params.maximun, 10); // Récupérer le nombre de réalisations à renvoyer

    const galeries = await Galerie.findAll({
      include: [
        // IMAGES
        {
          model: Image
        },
        // STYLES
        {
          model: Style,
          through: {
            attributes: []
          }
        },
        // PIECES
        {
          model: Piece,
          through: {
            attributes: []
          }
        }
      ],
      order: [
        ['ID', 'DESC'] // Tri par Titre en ordre croissant
      ],
      limit: maximun // Limiter le nombre de résultats
    });

   

    res.status(200).json(galeries);
  } catch (error) {
    console.error('Erreur lors de la récupération des galeries :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_galeries_by_piece/:pieceId', async (req, res) => {

  try {

    const pieceId = req.params.pieceId;

    const galeries = await Galerie.findAll({

      include: [

        {
          model: Piece,

          where: {
            ID: pieceId
          },

          through: {
            attributes: []
          }
        },

        {
          model: Style,
          through: {
            attributes: []
          }
        },

        {
          model: Image
        }

      ]

    });

    return res.status(200).json(galeries);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});

router.put('/update_galerie/:id', async (req, res) => {
  try {
    const galerieId = req.params.id;

    const {
      Titre,
      Type,
      Description,
      cover_image,
      pieces,
      styles,
      Images
    } = req.body;

    // 1. Trouver la galerie
    const galerie = await Galerie.findByPk(galerieId);

    if (!galerie) {
      return res.status(404).json({ error: 'Galerie introuvable' });
    }

    // 2. Update simple champs
    await galerie.update({
      Titre,
      Type,
      Description,
      cover_image
    });

    // =========================
    // IMAGES (simple stratégie : delete + recreate)
    // =========================

    /*
    await Image.destroy({
      where: { GalerieId: galerie.ID }
    });
    */

    if (Array.isArray(Images) && Images.length > 0) {
      await Promise.all(
        Images.map(img =>
          Image.create({
            Titre: img.Titre,
            Url: img.Url,
            GalerieID: galerie.ID
          })
        )
      );
    }

    // =========================
    // MANY TO MANY PIECES
    // =========================

    if (Array.isArray(pieces)) {
      await galerie.setPieces(pieces); // replace all relations
    }

    // =========================
    // MANY TO MANY STYLES
    // =========================

    if (Array.isArray(styles)) {
      await galerie.setStyles(styles); // replace all relations
    }

    // =========================
    // RELOAD FINAL
    // =========================

    const updated = await Galerie.findByPk(galerie.ID, {
      include: [Style, Piece]
    });

    return res.json(updated);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter des images à une galerie existante
router.post('/add_images_to_galerie/:galerieId', async (req, res) => {
  try {
    const galerieId = req.params.galerieId; // Récupérer l'ID de la galerie à partir des paramètres de la route
    const { Titre, Images } = req.body;

    // Vérifier si la galerie existe
    const galerie = await Galerie.findByPk(galerieId);
    if (!galerie) {
      return res.status(404).json({ error: 'Galerie non trouvée' });
    }

    // Mettre à jour le titre de la galerie si un nouveau titre est fourni
    if (Titre) {
      galerie.Titre = Titre;
      await galerie.save();
    }

    let nouvellesImages = [];
    if (Images) {
      // Ajouter chaque image à la galerie
      nouvellesImages = await Promise.all(Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: galerie.ID // Associer l'image à la galerie existante
        });
      }));
    }

    // Répondre avec les nouvelles images ajoutées
    res.status(201).json({ galerie, nouvellesImages });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout des images à la galerie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint DELETE pour supprimer une image d'une galerie
router.delete('/delete_image_from_gallery/:image_id', async (req, res) => {
  try {
    const imageId = req.params.image_id; // Récupérer l'ID de l'image à partir des paramètres de la route

    // Trouver l'image par ID
    const image = await Image.findByPk(imageId);

    // Vérifier si l'image existe
    if (!image) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }

    // Supprimer l'image de la base de données
    await image.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la suppression de l\'image :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




module.exports = router;
