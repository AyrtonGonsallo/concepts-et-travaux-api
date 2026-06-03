const express = require('express');
const router = express.Router();

const PieceCategorie=require('../PieceCategorie')

const Gamme=require('../Gamme')
const ejs = require('ejs');

const PointcleRealisation=require('../PointcleRealisation')

const Galerie=require('../Galerie')
const Equipement=require('../Equipement')
const ModeleEquipement=require('../ModeleEquipement')
const BesoinProjetRealisation=require('../BesoinProjetRealisation')
const EtapeProjetRealisation=require('../EtapeProjetRealisation')

const Image=require('../Image')
const Realisation=require('../Realisation')
const Piece=require('../Piece')





const multer = require('multer');
const path = require('path');

const nodemailer = require('nodemailer');
const { Op,Sequelize } = require('sequelize');

// Définir le chemin du répertoire contenant les fichiers
const filesDirectory = path.join(__dirname,'..', 'files');
// Créer un transporteur SMTP réutilisable pour envoyer des e-mails via https://homeren.fr/
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILS_HOST,
  port: Number(process.env.MAILS_PORT),
  secure: process.env.MAILS_PORT == 465, // true si 465
  auth: {
    user: process.env.MAILS_USER,
    pass: process.env.MAILS_PASSWORD
  }
});

  




// Endpoint POST pour ajouter une réalisation avec ses besoins et étapes
router.post('/ajouter_realisation', async (req, res) => {
  const sequelize = require('../config/database');  const transaction = await sequelize.transaction();

  try {
    // Récupérer les données de la requête
    const { Titre,SousTitre, Superficie, Prix, Image_principale, Description, Duree, Top, GalerieID, PieceID, Besoins, Etapes,Pointcles } = req.body;

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      SousTitre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top,
      GalerieID,
      PieceID
    }, { transaction });

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      // Ajouter les besoins associés à la réalisation
      await Promise.all(Besoins.map(async (besoinID) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoinID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Etapes.map(async (etapeID) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etapeID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Pointcles && Pointcles.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Pointcles.map(async (pointcleID) => {
        await PointcleRealisation.create({
          PointcleID: pointcleID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    await transaction.commit();

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    await transaction.rollback();
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour ajouter une réalisation avec ses besoins, étapes et galerie avec images
router.post('/add_realisation_with_gallery', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Superficie, Prix, Image_principale, Description, Duree, Top, Besoins, Etapes, Galery } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre: Galery.Titre // Ajouter d'autres propriétés de la galerie si nécessaire
    });

    // Vérifier si des images sont fournies dans la requête
    if (Galery && Galery.Images && Galery.Images.length > 0) {
      // Créer les images associées à la galerie
      const nouvellesImages = await Promise.all(Galery.Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url, // Ajouter d'autres propriétés de l'image si nécessaire
          GalerieID:nouvelleGalerie.ID
        });
      }));

      
    }

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top
    });

    // Associer la galerie à la réalisation
    await nouvelleRealisation.setGalerie(nouvelleGalerie);

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      // Ajouter les besoins associés à la réalisation
      await Promise.all(Besoins.map(async (besoin) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoin.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Etapes.map(async (etape) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etape.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.post('/ajouter_realisation', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Superficie, Prix, Image_principale, Description, Duree, Top, Besoins, Etapes, Galery, PieceID } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre: Galery.Titre
    });

    // Vérifier si des images sont fournies dans la requête
    if (Galery && Galery.Images && Galery.Images.length > 0) {
      await Promise.all(Galery.Images.map(async (image) => {
        await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: nouvelleGalerie.ID
        });
      }));
    }

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top,
      GalerieID: nouvelleGalerie.ID,
      PieceID: PieceID // Associer la réalisation à la pièce
    });

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      await Promise.all(Besoins.map(async (besoin) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoin.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      await Promise.all(Etapes.map(async (etape) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etape.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour ajouter une image et la lier à une galerie
router.post('/add_image', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Url, GalerieID } = req.body;

    // Créer une nouvelle image dans la base de données
    const nouvelleImage = await Image.create({
      Titre,
      Url,
      GalerieID // Spécifier l'ID de la galerie à laquelle l'image appartient
    });

    // Répondre avec l'image ajoutée
    res.status(201).json(nouvelleImage);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de l\'image :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




// Endpoint DELETE pour supprimer une pièce
router.delete('/delete_piece/:pieceId', async (req, res) => {
  try {
    const pieceId = req.params.pieceId; // Récupérer l'ID de la pièce à partir des paramètres de la route

    // Vérifier si la pièce existe
    const piece = await Piece.findByPk(pieceId);

    if (!piece) {
      return res.status(404).json({ error: 'Pièce non trouvée' });
    }

    // Supprimer la pièce
    await piece.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Pièce supprimée avec succès' });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la suppression de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}); 

router.post('/add_piece', async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();
  try {
    const { Image_principale,Image_presentation, Titre, Presentation, Description, Categories, Gallery } = req.body;

    // Créer une nouvelle pièce dans la base de données
    const nouvellePiece = await Piece.create({
      Image_principale,
      Image_presentation,
      Titre,
      Présentation:Presentation,
      Description
    }, { transaction });

    // Ajouter les catégories associées à la pièce
    if (Categories && Categories.length > 0) {
      await Promise.all(Categories.map(async (categorieID) => {
        await PieceCategorie.create({
          PieceID: nouvellePiece.ID,
          CategoriePieceID: categorieID
        }, { transaction });
      }));
    }

    // Vérifier si une galerie est fournie dans la requête
    if (Gallery) {
      const { Titre: GalerieTitre, Images } = Gallery;

      // Créer une nouvelle galerie dans la base de données
      const nouvelleGalerie = await Galerie.create({
        Titre: GalerieTitre
      }, { transaction });

      // Associer la galerie à la pièce
      nouvellePiece.GalerieID = nouvelleGalerie.ID;
      await nouvellePiece.save({ transaction });

      // Ajouter les images associées à la galerie
      if (Images && Images.length > 0) {
        await Promise.all(Images.map(async (image) => {
          await Image.create({
           
            Titre: image.Titre,
            Url: image.Url,
            GalerieID: nouvelleGalerie.ID
          }, { transaction });
        }));
      }
    }

    await transaction.commit();

    res.status(201).json(nouvellePiece);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/ajouter_piece', async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();
  try {
    const { Image_principale,Image_presentation, Titre, Presentation, Description, Categories, GalerieID } = req.body;

    // Créer une nouvelle pièce dans la base de données
    const nouvellePiece = await Piece.create({
      Image_principale,
      Image_presentation,
      Titre,
      Présentation: Presentation,
      Description,
      GalerieID // Associer directement l'ID de la galerie fourni
    }, { transaction });

    // Ajouter les catégories associées à la pièce
    if (Categories && Categories.length > 0) {
      await Promise.all(Categories.map(async (categorieID) => {
        await PieceCategorie.create({
          PieceID: nouvellePiece.ID,
          CategoriePieceID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();

    res.status(201).json({
      ID: nouvellePiece.ID,
      GalerieID: nouvellePiece.GalerieID // Retourne l'ID de la galerie associée
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
