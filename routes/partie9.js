const express = require('express');
const router = express.Router();
const Travail=require('../Travail')
const PieceTravail=require('../PieceTravail')
const Avis=require('../Avis')
const Page=require('../Page')
const Equipement=require('../Equipement')
const ModeleEquipement=require('../ModeleEquipement')
const Piece=require('../Piece')
const { Op,Sequelize } = require('sequelize');



// Delete
router.delete('/delete_avis/:id', async (req, res) => {
  try {
      const deleted = await Avis.destroy({
          where: { ID: req.params.id }
      });
      if (deleted) {
          res.status(204).json({ message: 'Avis deleted' });
      } else {
          res.status(404).json({ error: 'Avis not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Créer une nouvelle page
router.post('/add_page', async (req, res) => {
  try {
    const newPage = await Page.create(req.body);
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire toutes les pages
router.get('/get_pages', async (req, res) => {
  try {
    const pages = await Page.findAll();
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire une seule page par ID
router.get('/get_page/:id', async (req, res) => {
  try {
    const page = await Page.findByPk(req.params.id);
    if (page) {
      res.status(200).json(page);
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire une seule page par Titre
router.get('/get_page_by_title/:titre', async (req, res) => {
  const { titre } = req.params;
  try {
    const page = await Page.findOne({ where: { Titre: titre } });
    if (page) {
      res.status(200).json(page);
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Mettre à jour une page par ID
router.put('/update_page/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pageUpdates = req.body;
    if (!pageUpdates.Content_balise_og_image) {
      delete pageUpdates.Content_balise_og_image; // Supprimer le champ si vide pour ne pas le modifier
    }
    // Effectuer la mise à jour dans la base de données
    const [updatedRowCount] = await Page.update(pageUpdates, {
      where: { ID: id }
    });
    if (updatedRowCount > 0) {
      // Si la mise à jour est réussie, récupérer la page mise à jour
      const updatedPage = await Page.findByPk(id);
      res.status(200).json(updatedPage);
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une page par ID
router.delete('/delete_page/:id', async (req, res) => {
  try {
    const deleted = await Page.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json({ message: 'Page deleted' });
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Create
router.post('/add_equipement/', async (req, res) => {
  try {
    const newEquipement = await Equipement.create(req.body);
    res.status(201).json(newEquipement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all
router.get('/get_equipements/', async (req, res) => {
  try {
    const equipements = await Equipement.findAll({
      include: [
        { model: Piece }
      ],
      order: [['Type', 'ASC'],['Titre', 'ASC']]
    });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read one
router.get('/get_equipement/:id', async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id,{
      include: [
        {
          model: Piece, // Inclure les informations de la pièce associée à l'équipement
        },
        {
          model: ModeleEquipement, // Inclure tous les modèles d'équipement associés à l'équipement
          as: 'Modeles'
        },
      ],
    });
    if (equipement) {
      res.status(200).json(equipement);
    } else {
      res.status(404).json({ error: 'Equipement not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint pour récupérer les Equipements par PieceID
router.get('/get_equipements_by_piece/:pid', async (req, res) => {
  try {
    const pieceID = req.params.pid;
    const equipements = await Equipement.findAll({
      where: { PieceID: pieceID },
      include: [
        {
          model: Piece, // Inclure les informations de la pièce associée à l'équipement
        },
        {
          model: ModeleEquipement, // Inclure tous les modèles d'équipement associés à l'équipement
          as:'Modeles'
        },
      ],
      order: [['ID', 'ASC']]
    });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint pour récupérer les Equipements par PieceID
router.get('/get_equipements_by_type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const equipements = await Equipement.findAll({
  where: { Type: type },
  include: [
    {
      model: Piece, // aucun alias défini ici, donc ok
    },
    {
      model: ModeleEquipement,
      as: 'Modeles', // ⚠️ il faut l'alias défini dans la relation
    },
  ],
});

    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Update
router.put('/update_equipement/:id', async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);
    if (equipement) {
      // Créez une copie de req.body
      const updateData = { ...req.body };

      // Si le champ Image est vide, supprimez-le de updateData
      if (!req.body.Image) {
        delete updateData.Image;
      }

      await equipement.update(updateData);
      res.status(200).json(equipement);
    } else {
      res.status(404).json({ error: 'Equipement not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete
router.delete('/delete_equipement/:id', async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);
    if (equipement) {
      await equipement.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Equipement not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/add_travail', async (req, res) => {
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
  const transaction = await sequelize.transaction();
  try {
    const {  Titre, Description, Pieces } = req.body;

    // Créer une nouvelle pièce dans la base de données
    const nouveauTravail = await Travail.create({
      Titre,
      Description
    }, { transaction });

    // Ajouter les catégories associées à la pièce
    if (Pieces && Pieces.length > 0) {
      await Promise.all(Pieces.map(async (pieceID) => {
        await PieceTravail.create({
          PieceID: pieceID,
          TravailID: nouveauTravail.ID
        }, { transaction });
      }));
    }


    await transaction.commit();

    res.status(201).json(nouveauTravail);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout du travail :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET travaux par PieceID
router.get('/get_travaux_by_piece/:pid', async (req, res) => {
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
  const pieceId = req.params.pid;

  try {
    // Récupérer les questions associées à la catégorie spécifiée
    const questions = await sequelize.query(
      `SELECT t.* FROM Travail t,PieceTravail pt,Piece p
       WHERE t.ID=pt.TravailID and p.ID=pt.PieceID and
       p.ID = :pieceId`,
      {
        replacements: { pieceId },
        type: Sequelize.QueryTypes.SELECT,
        model: Travail,
        mapToModel: true,
        
      }
    );

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux par piece :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




// GET validated travaux par PieceID
router.get('/get_validated_travaux_by_piece/:pid', async (req, res) => {
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
  const pieceId = req.params.pid;

  try {
    // Récupérer les questions associées à la catégorie spécifiée
    const questions = await sequelize.query(
      `SELECT t.* FROM Travail t,PieceTravail pt,Piece p
       WHERE t.ID=pt.TravailID and p.ID=pt.PieceID and
       p.ID = :pieceId and t.Valide=0 order  by t.Titre asc`,//0 a cause du monsieur mathieu qui appele ce champ masqué
      {
        replacements: { pieceId },
        type: Sequelize.QueryTypes.SELECT,
        model: Travail,
        mapToModel: true,
        
      }
    );

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux par piece :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET tous les travaux
router.get('/get_travaux', async (req, res) => {
  try {
    const travaux = await Travail.findAll({
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: [] // Si vous ne voulez pas inclure les attributs de la table de jointure PieceTravail
        }
      },
      order: [['Titre', 'ASC']]
    });

    res.status(200).json(travaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET tous les travaux
router.get('/get_active_travaux', async (req, res) => {
  try {
    const travaux = await Travail.findAll({
       where: { Valide: 0 },
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: [] // Si vous ne voulez pas inclure les attributs de la table de jointure PieceTravail
        }
      },
      order: [['Titre', 'ASC']]
    });

    res.status(200).json(travaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// GET tous les travaux sans_equipements
router.get('/get_active_travaux_sans_equipements', async (req, res) => {
  try {
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail
    const travaux = await Travail.findAll({
      where: {
        Valide: 0,
        id: {
          [Op.notIn]: listeIds // optionnel si tu veux filtrer aussi par IDs
        }
      },
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: []
        }
      },
      order: [['Titre', 'ASC']]
    });

    res.status(200).json(travaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// GET tous les travaux avec_equipements
router.get('/get_active_travaux_avec_equipements', async (req, res) => {
  try {
    const listeIds = [2, 7, 13, 15, 16, 12]; // tes IDs Travail
    const travaux = await Travail.findAll({
      where: {
        Valide: 0,
        id: {
           [Op.in]: listeIds // optionnel si tu veux filtrer aussi par IDs
        }
      },
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: []
        }
      },
      order: [['Titre', 'ASC']]
    });

    res.status(200).json(travaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// GET travail par ID avec les détails de la pièce associée
router.get('/get_travail/:id', async (req, res) => {
  try {
    const travailID = req.params.id;

    // Recherche le travail par son ID avec les détails de la pièce associée
    const travail = await Travail.findByPk(travailID, {
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: [] // Si vous ne voulez pas inclure les attributs de la table de jointure PieceTravail
        }
      }
    });

    if (!travail) {
      res.status(404).json({ error: 'Travail non trouvé' });
      return;
    }

    res.status(200).json(travail);
  } catch (error) {
    console.error('Erreur lors de la récupération du travail par ID avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Update travail par ID
router.put('/update_travail/:id', async (req, res) => {
  try {
    const travailID = req.params.id;
    const { Titre, Description,Valide, Pieces } = req.body;

    // Recherche le travail par son ID
    const travail = await Travail.findByPk(travailID);
    if (!travail) {
      res.status(404).json({ error: 'Travail non trouvé' });
      return;
    }

    // Mettre à jour les données du travail
    await travail.update({ Titre, Description,Valide });

    // Mettre à jour les pièces associées (via la table de jointure PieceTravail)
    if (Pieces && Pieces.length > 0) {
      // Supprimer les associations existantes
      await PieceTravail.destroy({ where: { TravailID: travailID } });

      // Créer les nouvelles associations
      await Promise.all(Pieces.map(async (pieceID) => {
        await PieceTravail.create({
          PieceID: pieceID,
          TravailID: travailID
        });
      }));
    }

    // Renvoyer le travail mis à jour avec les détails de la pièce
    const travailUpdated = await Travail.findByPk(travailID, {
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: [] // Si vous ne voulez pas inclure les attributs de la table de jointure PieceTravail
        }
      }
    });

    res.status(200).json(travailUpdated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du travail :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// Delete travail par ID
router.delete('/delete_travail/:id', async (req, res) => {
  try {
    const travailID = req.params.id;

    // Recherche le travail par son ID
    const travail = await Travail.findByPk(travailID);
    if (!travail) {
      res.status(404).json({ error: 'Travail non trouvé' });
      return;
    }

    // Supprimer le travail
    await travail.destroy();

    // Supprimer les associations dans PieceTravail
    await PieceTravail.destroy({ where: { TravailID: travailID } });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du travail :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour ajouter un nouveau modèle d'équipement
router.post('/add_modele_equipement', async (req, res) => {
  try {
    const { Titre, Description, Image,PrixFournisseur,PrixPose, Prix,Longeur, Largeur, Hauteur, Epaisseur,NombreDeVasques,Etape, Matiere, EquipementID,ActiverFournisseur,FournisseurID,ModeleDeReferenceID } = req.body;

    // Création du modèle d'équipement dans la base de données
    const newModeleEquipement = await ModeleEquipement.create({
      Titre,
      Description,
      Image,
      PrixFournisseur,
      PrixPose,
      Prix,
      Longeur,
      Largeur,
      Hauteur,
      Epaisseur,
      Etape,
      NombreDeVasques,
      Matiere,
      EquipementID,ActiverFournisseur,FournisseurID,ModeleDeReferenceID
    });

    res.status(201).json(newModeleEquipement);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du modèle d\'équipement :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET one by ID
router.get('/get_modele_equipement/:id', async (req, res) => {
  try {
    const modele = await ModeleEquipement.findByPk(req.params.id);
    if (modele) {
      res.status(200).json(modele);
    } else {
      res.status(404).json({ error: 'Modèle non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du modèle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// Update
router.put('/update_modele_equipement/:id', async (req, res) => {
  try {
    const modele = await ModeleEquipement.findByPk(req.params.id);
    if (modele) {
      // Mise à jour des champs requis
      modele.Titre = req.body.Titre;
      modele.Description = req.body.Description;
      modele.PrixFournisseur = req.body.PrixFournisseur;
      modele.PrixPose = req.body.PrixPose;
      modele.Prix = req.body.Prix;
      modele.Longeur = req.body.Longeur;
      modele.Largeur = req.body.Largeur;
      modele.Hauteur = req.body.Hauteur;
      modele.Epaisseur = req.body.Epaisseur;
      modele.NombreDeVasques = req.body.NombreDeVasques
      modele.Matiere = req.body.Matiere;
      modele.Etape = req.body.Etape;
      modele.ModeleDeReferenceID = req.body.ModeleDeReferenceID;
      modele.FournisseurID = req.body.FournisseurID;
      modele.ActiverFournisseur = req.body.ActiverFournisseur;
      modele.EquipementID = req.body.EquipementID;

      // Mise à jour de l'image uniquement si elle est fournie dans req.body
      if (req.body.Image !== undefined && req.body.Image !== null && req.body.Image !== '') {
        modele.Image = req.body.Image;
      }

      // Enregistrement des modifications
      await modele.save();

      res.status(200).json(modele);
    } else {
      res.status(404).json({ error: 'Modèle non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du modèle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



module.exports = router;
