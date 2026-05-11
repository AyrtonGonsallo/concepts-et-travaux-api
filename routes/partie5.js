const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const RoleAutorisation = require('../RoleAutorisation');

const Travail=require('../Travail')

const PointcleRealisation=require('../PointcleRealisation')
const BesoinProjet=require('../Besoin_projet')
const CategoriePiece=require('../Categorie_piece')
const EtapeProjet=require('../Etape_projet')
const EtapeDevis=require('../Etape_devis')

const BesoinProjetRealisation=require('../BesoinProjetRealisation')
const EtapeProjetRealisation=require('../EtapeProjetRealisation')

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

  




// Endpoint DELETE pour supprimer une autorisation par son ID
router.delete('/delete_autorisation/:id', async (req, res) => {
  const autorisationId = req.params.id;

  try {
    // Recherchez l'autorisation dans la base de données par son ID
    const autorisation = await Autorisation.findByPk(autorisationId);

    // Vérifiez si l'autorisation existe
    if (!autorisation) {
      return res.status(404).json({ message: 'Autorisation non trouvée' });
    }

    // Supprimez l'autorisation de la base de données
    await autorisation.destroy();

    // Répondez avec un message de succès
    res.json({ message: 'Autorisation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'autorisation :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'autorisation' });
  }
});

// Endpoint DELETE pour supprimer un rôle par son ID
router.delete('/delete_role/:id', async (req, res) => {
  const roleId = req.params.id;

  try {
    // Recherchez le rôle dans la base de données par son ID
    const role = await Role.findByPk(roleId);

    // Vérifiez si le rôle existe
    if (!role) {
      return res.status(404).json({ message: 'Rôle non trouvé' });
    }

    // Supprimez le rôle de la base de données
    await role.destroy();

    // Répondez avec un message de succès
    res.json({ message: 'Rôle supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du rôle :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du rôle' });
  }
});

// Endpoint DELETE pour supprimer un utilisateur par son ID
router.delete('/delete_utilisateur/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Recherchez l'utilisateur dans la base de données par son ID
    const utilisateur = await Utilisateur.findByPk(userId);

    // Vérifiez si l'utilisateur existe
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimez l'utilisateur de la base de données
    await utilisateur.destroy();

    // Répondez avec un message de succès
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
});


// Endpoint PUT pour mettre à jour un rôle par son ID
router.put('/update_role/:id', async (req, res) => {
  const roleId = req.params.id;
  const { Titre, Commentaire, Autorisations } = req.body;

  try {
    // Recherchez le rôle dans la base de données par son ID
    const role = await Role.findByPk(roleId, {
      include: Autorisation // Inclure les autorisations associées au rôle
    });

    // Vérifiez si le rôle existe
    if (!role) {
      return res.status(404).json({ message: 'Rôle non trouvé' });
    }

    // Mettez à jour les données du rôle
    await role.update({ Titre, Commentaire });

    // Mettez à jour les autorisations associées au rôle
    // Supprimer toutes les autorisations existantes associées à ce rôle
    await RoleAutorisation.destroy({
      where: {
        RoleId: roleId
      }
    });

    // Ajouter les nouvelles autorisations au rôle
    if (Autorisations && Autorisations.length > 0) {
      await Promise.all(Autorisations.map(async (autorisation) => {
        try {
          // Associer l'autorisation au rôle
          await RoleAutorisation.create({
            RoleId: roleId,
            AutorisationId: autorisation.Id
          });
        } catch (error) {
          console.error('Erreur lors de l\'association de l\'autorisation au rôle :', error);
        }
      }));
    }

    // Répondre avec le rôle mis à jour, y compris les nouvelles autorisations
    const updatedRole = await Role.findByPk(roleId, {
      include: Autorisation // Inclure les autorisations associées au rôle
    });
    res.json({ message: 'Rôle mis à jour avec succès', role: updatedRole });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du rôle' });
  }
});



// Endpoint PUT pour mettre à jour une autorisation par son ID
router.put('/update_autorisation/:id', async (req, res) => {
  const autorisationId = req.params.id;
  const { Explications, Titre } = req.body;

  try {
    // Recherchez l'autorisation dans la base de données par son ID
    const autorisation = await Autorisation.findByPk(autorisationId);

    // Vérifiez si l'autorisation existe
    if (!autorisation) {
      return res.status(404).json({ message: 'Autorisation non trouvée' });
    }

    // Mettez à jour les données de l'autorisation
    await autorisation.update({ Explications, Titre });

    // Répondez avec l'autorisation mise à jour
    res.json({ message: 'Autorisation mise à jour avec succès', autorisation });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'autorisation :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'autorisation' });
  }
});

// Endpoint POST pour ajouter un besoin de projet
router.post('/ajouter_besoin_projet', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    // Création du besoin de projet dans la base de données
    const besoin_projet = await BesoinProjet.create({ Titre, Description });
    res.status(201).json(besoin_projet);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du besoin de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter une catégorie de piece
router.post('/ajouter_categorie_piece', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    // Création de la catégorie de projet dans la base de données
    const categorie_projet = await CategoriePiece.create({ Titre, Description });
    res.status(201).json(categorie_projet);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter une étape de projet
router.post('/ajouter_etape_projet', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    // Création de l'étape de projet dans la base de données
    const etape_projet = await EtapeProjet.create({ Titre, Description });
    res.status(201).json(etape_projet);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'étape de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/ajouter_etape_devis', async (req, res) => {
  try {
    const {
      Titre,
      Sous_titre,
      Description,
      Description_chambre,
      Description_sdb,
      Description_salle_manger,
      Description_wc,
      Description_cuisine,
      Description_salon,
      Description_garage,
      Description_buanderie,
      TravailID,
      Etape
    } = req.body;

    // Création de l'étape de devis dans la base de données
    const etape_d = await EtapeDevis.create({
      Titre,
      Sous_titre,
      Description,
      Description_chambre,
      Description_sdb,
      Description_salle_manger,
      Description_wc,
      Description_cuisine,
      Description_salon,
      Description_garage,
      Description_buanderie,
      TravailID,
      Etape
    });

    res.status(201).json(etape_d);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'étape de devis :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_etapes_devis', async (req, res) => {
  try {
    const etapesDevis = await EtapeDevis.findAll({
      include: [{ model: Travail }]
    });

    res.status(200).json(etapesDevis);
  } catch (error) {
    console.error("Erreur lors de la récupération des étapes de devis :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_etape_devis/:id', async (req, res) => {
  try {
    const etapeDevis = await EtapeDevis.findByPk(req.params.id, {
      include: [{ model: Travail }]
    });

    if (!etapeDevis) {
      return res.status(404).json({ error: 'Étape de devis non trouvée' });
    }

    res.status(200).json(etapeDevis);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étape de devis :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/update_etape_devis/:id', async (req, res) => {
  try {
    const {
      Titre,
      Sous_titre,
      Description,
      Description_chambre,
      Description_sdb,
      Description_salle_manger,
      Description_wc,
      Description_cuisine,
      Description_salon,
      Description_garage,
      Description_buanderie,
      TravailID,
      Etape
    } = req.body;

    const etapeDevis = await EtapeDevis.findByPk(req.params.id);

    if (!etapeDevis) {
      return res.status(404).json({ error: 'Étape de devis non trouvée' });
    }

    // Mise à jour des champs
    etapeDevis.Titre = Titre || etapeDevis.Titre;
    etapeDevis.Sous_titre = Sous_titre || etapeDevis.Sous_titre;
    
    etapeDevis.Description = Description || etapeDevis.Description;
    etapeDevis.Description_chambre = Description_chambre || etapeDevis.Description_chambre;
    etapeDevis.Description_sdb = Description_sdb || etapeDevis.Description_sdb;
    etapeDevis.Description_salle_manger = Description_salle_manger || etapeDevis.Description_salle_manger;
    etapeDevis.Description_wc = Description_wc || etapeDevis.Description_wc;
    etapeDevis.Description_garage = Description_garage || etapeDevis.Description_garage;
    etapeDevis.Description_buanderie = Description_buanderie || etapeDevis.Description_buanderie;
    etapeDevis.Description_cuisine = Description_cuisine || etapeDevis.Description_cuisine;
    etapeDevis.Description_salon = Description_salon || etapeDevis.Description_salon;
    etapeDevis.TravailID = TravailID || etapeDevis.TravailID;
    etapeDevis.Etape = Etape || etapeDevis.Etape;

    await etapeDevis.save();

    res.status(200).json(etapeDevis);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étape de devis :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/delete_etape_devis/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await EtapeDevis.destroy({
      where: { ID: id }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Étape de devis non trouvée' });
    }

    res.status(200).json({ message: 'Étape de devis supprimée avec succès' });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étape de devis :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint DELETE pour supprimer une réalisation sans les relations (besoins et étapes)
router.delete('/delete_realisation/:realisationId', async (req, res) => {
  try {
    const realisationId = req.params.realisationId; // Récupérer l'ID de la réalisation à partir des paramètres de la route

    // Vérifier si la réalisation existe
    const realisation = await Realisation.findByPk(realisationId);

    if (!realisation) {
      return res.status(404).json({ error: 'Réalisation non trouvée' });
    }

    // Supprimer la réalisation
    await realisation.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Réalisation supprimée avec succès' });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la suppression de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter une réalisation avec ses besoins et étapes
router.post('/add_realisation', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre,SousTitre, Superficie, Prix, Image_principale, Description, Duree, Top, Besoins, Etapes,Pointcles } = req.body;

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      SousTitre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top
    });

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

    // Vérifier si des étapes sont fournies dans la requête
    if (Pointcles && Pointcles.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Pointcles.map(async (point) => {
        await PointcleRealisation.create({
          PointcleID: point.ID,
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

// Endpoint PUT pour mettre à jour une réalisation avec ses besoins et étapes
router.put('/update_realisation/:realisationId', async (req, res) => {
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
    const realisationId = req.params.realisationId; // Récupérer l'ID de la réalisation à partir des paramètres de la route
    const {
      Titre,
      SousTitre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top,
      GalerieID,
      PieceID,
      Besoins,
      Etapes,
      Pointcles
    } = req.body; // Récupérer les données de la requête

    // Trouver la réalisation par ID
    let realisation = await Realisation.findByPk(realisationId, { transaction });

    // Vérifier si la réalisation existe
    if (!realisation) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Réalisation non trouvée' });
    }

    // Mettre à jour les champs de la réalisation
    realisation.Titre = Titre;
    realisation.SousTitre = SousTitre;
    realisation.Superficie = Superficie;
    realisation.Prix = Prix;
    realisation.Description = Description;
    realisation.Duree = Duree;
    realisation.Top = Top;
    realisation.GalerieID = GalerieID;
    realisation.PieceID = PieceID;

    // Mettre à jour l'image principale seulement si elle est fournie
    if (Image_principale) {
      realisation.Image_principale = Image_principale;
    }

    // Sauvegarder les changements apportés à la réalisation
    await realisation.save({ transaction });

    // Supprimer les besoins existants liés à la réalisation
    await BesoinProjetRealisation.destroy({
      where: {
        RealisationID: realisationId
      },
      transaction
    });

    // Supprimer les étapes existantes liées à la réalisation
    await EtapeProjetRealisation.destroy({
      where: {
        RealisationID: realisationId
      },
      transaction
    });

    // Supprimer les étapes existantes liées à la réalisation
    await PointcleRealisation.destroy({
      where: {
        RealisationID: realisationId
      },
      transaction
    });

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      // Ajouter les nouveaux besoins associés à la réalisation
      await Promise.all(Besoins.map(async (besoinID) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoinID,
          RealisationID: realisationId
        }, { transaction });
      }));
    }

     // Vérifier si des besoins sont fournis dans la requête
     if (Pointcles && Pointcles.length > 0) {
      // Ajouter les nouveaux besoins associés à la réalisation
      await Promise.all(Pointcles.map(async (besoinID) => {
        await PointcleRealisation.create({
          PointcleID: besoinID,
          RealisationID: realisationId
        }, { transaction });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      // Ajouter les nouvelles étapes associées à la réalisation
      await Promise.all(Etapes.map(async (etapeID) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etapeID,
          RealisationID: realisationId
        }, { transaction });
      }));
    }

    await transaction.commit();

    // Répondre avec la réalisation mise à jour
    res.status(200).json(realisation);
  } catch (error) {
    await transaction.rollback();
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la mise à jour de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
