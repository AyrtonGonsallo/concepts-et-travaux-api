const express = require('express');
const router = express.Router();

const PieceCategorie=require('../PieceCategorie')
const Travail=require('../Travail')
const Recuperation=require('../Recuperation')
const PieceTravail=require('../PieceTravail')
const Pointcle=require('../Pointcle')
const Avis=require('../Avis')
const Gamme=require('../Gamme')
const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')
const Page=require('../Page')
const PointcleRealisation=require('../PointcleRealisation')
const BesoinProjet=require('../Besoin_projet')
const CategoriePiece=require('../Categorie_piece')
const EtapeProjet=require('../Etape_projet')
const EtapeDevis=require('../Etape_devis')
const Galerie=require('../Galerie')
const Equipement=require('../Equipement')
const ModeleEquipement=require('../ModeleEquipement')
const BesoinProjetRealisation=require('../BesoinProjetRealisation')
const EtapeProjetRealisation=require('../EtapeProjetRealisation')
const QuestionCategorie=require('../QuestionCategorie')
const QuestionFaq=require('../QuestionFaq')
const CategorieQuestionFaq=require('../CategorieQuestionFaq')
const Image=require('../Image')
const Realisation=require('../Realisation')
const Piece=require('../Piece')
const ProjetDevis = require('../ProjetDevis');
const cors = require('cors');
const Projet = require('../Projet'); 
const Autorisation = require('../Autorisation'); // Importez le modèle Grade




const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de "sauts" pour générer le sel
const fs = require('fs');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const { Op,Sequelize } = require('sequelize');
const Stripe = require('stripe');
const bodyParser = require('body-parser');

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

  





// Endpoint PUT pour mettre à jour une pièce
router.put('/update_piece/:pieceId', async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();
  
  try {
    const pieceId = req.params.pieceId; // Récupérer l'ID de la pièce à mettre à jour
    const { Image_principale, Image_presentation, Titre, Présentation, Description, Categories, GalerieID } = req.body;

    // Vérifier si la pièce existe
    let piece = await Piece.findByPk(pieceId, { transaction });

    if (!piece) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Pièce non trouvée' });
    }

    // Mettre à jour les propriétés de la pièce
    piece.Titre = Titre;
    piece.Présentation = Présentation;
    piece.Description = Description;
    piece.GalerieID = GalerieID;

    // Mettre à jour les images si elles sont fournies et non nulles
    if (Image_principale) {
      piece.Image_principale = Image_principale;
    }

    if (Image_presentation) {
      piece.Image_presentation = Image_presentation;
    }

    // Enregistrer les modifications de la pièce
    await piece.save({ transaction });

    // Supprimer les catégories actuelles associées à la pièce
    await PieceCategorie.destroy({
      where: {
        PieceID: pieceId
      },
      transaction
    });

    // Ajouter les nouvelles catégories associées à la pièce
    if (Categories && Categories.length > 0) {
      await Promise.all(Categories.map(async (categorieID) => {
        await PieceCategorie.create({
          PieceID: pieceId,
          CategoriePieceID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();

    res.status(200).json({ message: 'Pièce mise à jour avec succès' });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la mise à jour de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_realisations', async (req, res) => {
  try {
    const realisations = await Realisation.findAll({
      include: [
        { model: Galerie },
        { model: Piece },
        { model: EtapeProjet, 
          through: { 
            
            attributes: [],
          }  
        },
        { model: BesoinProjet,
           through: { 
            attributes: [],
          }  
        },
        { model: Pointcle,
          through: { 
           attributes: [],
         }  
       }
      ]
    });

    res.status(200).json(realisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réalisations :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.get('/get_realisations_by_piece/:p_id', async (req, res) => { // Ajout de ":" avant "p_id"
  try {
    const p_id = parseInt(req.params.p_id, 10); // Récupérer l'ID de la pièce depuis les paramètres de l'URL

    const realisations = await Realisation.findAll({
      include: [
        { model: Galerie },
        { model: Piece,
          where: { ID: p_id } // Utilisation correcte de p_id dans la clause where
        },
        { model: EtapeProjet, 
          through: { 
            attributes: [],
          }  
        },
        { model: BesoinProjet,
           through: { 
            attributes: [],
          }  
        },
        { model: Pointcle,
          through: { 
           attributes: [],
         }  
       }
      ]
    });

    res.status(200).json(realisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réalisations :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.get('/get_nbr_realisations/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count, 10); // Récupérer le nombre de réalisations à renvoyer

    const realisations = await Realisation.findAll({
      include: [
        { model: Galerie },
        { model: Piece },
        { model: EtapeProjet, 
          through: { 
            attributes: [],
          }  
        },
        { model: BesoinProjet,
           through: { 
            attributes: [],
          }  
        },
        { model: Pointcle,
          through: { 
           attributes: [],
         }  
       }
      ],
      limit: count // Limiter le nombre de résultats
    });

    res.status(200).json(realisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réalisations :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une réalisation par son ID avec ses relations
router.get('/get_realisation/:id', async (req, res) => {
  try {
    const realisationId = req.params.id;

    // Récupérer la réalisation avec ses relations
    const realisation = await Realisation.findByPk(realisationId, {
      include: [
        { model: Galerie },
        { model: Piece },
        { model: EtapeProjet, 
          through: { 
            
            attributes: [],
          }  
        },
        { model: BesoinProjet,
           through: { 
            attributes: [],
          }  
        },
        { model: Pointcle,
          through: { 
           attributes: [],
         }  
       }
      ]
    });

    if (!realisation) {
      return res.status(404).json({ message: 'Réalisation non trouvée' });
    }

    res.status(200).json(realisation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer toutes les pièces avec leurs catégories et leur galerie
router.get('/get_pieces', async (req, res) => {
  try {
    const pieces = await Piece.findAll({
      include: [
        { model: CategoriePiece 
          , 
          through: { 
            
            attributes: [],
          }  
        },
        { model: Galerie }
      ],
      order: [
        ['Titre', 'ASC'] // Tri par Titre en ordre croissant
      ]
    });
    res.status(200).json(pieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_pieces_par_categories', async (req, res) => {
  const sequelize = require('../config/database');


  try {
    const query = `
      SELECT p.ID, p.Titre, p.Image_principale,p.Image_presentation,  c.ID as cat_id, c.Titre as categorie
      FROM Piece p
      INNER JOIN PieceCategorie pc ON p.ID = pc.PieceID
       INNER JOIN Categorie_piece c ON c.ID = pc.CategoriePieceID
      ORDER BY c.ID, p.ID`;

    const pieces = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    let result = [];
    let currentCategorie = 0;
    let categorieObject = null;

    pieces.forEach(row => {
      if (row.cat_id != currentCategorie) {
        // Nouvelle catégorie
        if (categorieObject !== null) {
          result.push(categorieObject);
        }
        currentCategorie = row.cat_id;
        categorieObject = {
          CategorieID: row.cat_id,
          Titre: row.categorie,
          Pieces: []
        };
      }
      // Ajouter la question à la catégorie actuelle
      categorieObject.Pieces.push({
        ID: row.ID,
        Titre: row.Titre,
        Image_principale: row.Image_principale,
        Image_presentation: row.Image_presentation,
      });
    });

    // Ajouter la dernière catégorie à la liste résultante
    if (categorieObject !== null) {
      result.push(categorieObject);
    }

    res.status(200).json(result);
  } catch (error) {
console.error('Erreur lors de la récupération des questions par catégorie :', error);
res.status(500).json({ error: 'Erreur serveur' });
}
});


router.get('/get_nbr_pieces/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count, 10); // Récupérer le nombre de pièces à renvoyer

    const pieces = await Piece.findAll({
      include: [
        { model: CategoriePiece, 
          through: { 
            attributes: [],
          }  
        },
        { model: Galerie }
      ],
      order: [
        ['Titre', 'ASC'] // Tri par Titre en ordre croissant
      ],
      limit: count // Limiter le nombre de résultats
    });

    res.status(200).json(pieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour récupérer une pièce spécifique avec ses catégories et sa galerie
router.get('/get_piece/:id', async (req, res) => {
  const pieceId = req.params.id;
  try {
    const piece = await Piece.findByPk(pieceId, {
      include: [
        { model: CategoriePiece },
        { model: Galerie }
      ]
    });
    if (piece) {
      res.status(200).json(piece);
    } else {
      res.status(404).json({ message: `Pièce avec l'ID ${pieceId} non trouvée` });
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de la pièce avec l'ID ${pieceId} :`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Définir le point de terminaison pour supprimer un projet
router.delete('/delete_galerie/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Galerie.destroy({ where: { Id: id } });

    if (result) {
      res.status(200).json({ message: 'galerie deleted successfully.' });
    } else {
      res.status(404).json({ error: 'galerie not found.' });
    }
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ error: 'An error occurred while deleting the gallery.' });
  }
});


router.get('/get_etapes_projet', async (req, res) => {
  try {
    const etapesProjet = await EtapeProjet.findAll();
    res.status(200).json(etapesProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une étape de projet par son ID
router.get('/get_etape_projet/:id', async (req, res) => {
  try {
    const etapeProjet = await EtapeProjet.findByPk(req.params.id);
    if (!etapeProjet) {
      return res.status(404).json({ error: 'Étape de projet non trouvée' });
    }
    res.status(200).json(etapeProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étape de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour une étape de projet
router.put('/update_etape_projet/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const etapeProjet = await EtapeProjet.findByPk(req.params.id);
    if (!etapeProjet) {
      return res.status(404).json({ error: 'Étape de projet non trouvée' });
    }

    etapeProjet.Titre = Titre || etapeProjet.Titre;
    etapeProjet.Description = Description || etapeProjet.Description;
    await etapeProjet.save();

    res.status(200).json(etapeProjet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étape de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une étape de projet par son ID
router.delete('/delete_etape_projet/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await EtapeProjet.destroy({ where: { Id: id } });
    res.status(200).json({ message: 'Étape de projet supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étape de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




router.get('/get_besoins_projet', async (req, res) => {
  try {
    const besoinsProjet = await BesoinProjet.findAll();
    res.status(200).json(besoinsProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération des besoins du projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer un besoin de projet par son ID
router.get('/get_besoin_projet/:id', async (req, res) => {
  try {
    const besoinProjet = await BesoinProjet.findByPk(req.params.id);
    if (!besoinProjet) {
      return res.status(404).json({ error: 'Besoin de projet non trouvé' });
    }
    res.status(200).json(besoinProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération du besoin de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour un besoin de projet
router.put('/update_besoin_projet/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const besoinProjet = await BesoinProjet.findByPk(req.params.id);
    if (!besoinProjet) {
      return res.status(404).json({ error: 'Besoin de projet non trouvé' });
    }

    besoinProjet.Titre = Titre || besoinProjet.Titre;
    besoinProjet.Description = Description || besoinProjet.Description;
    await besoinProjet.save();

    res.status(200).json(besoinProjet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du besoin de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer un besoin de projet par son ID
router.delete('/delete_besoin_projet/:id', async (req, res) => {
  try {
    const rowsDeleted = await BesoinProjet.destroy({
      where: { ID: req.params.id }
    });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Besoin de projet non trouvé' });
    }
    res.status(200).json({ message: 'Besoin de projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du besoin de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
