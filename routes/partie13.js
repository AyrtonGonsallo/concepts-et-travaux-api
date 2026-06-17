const express = require('express');
const router = express.Router();
const Utilisateur = require('../Utilisateur');
const Visite=require('../Visite')
const Paiement=require('../Paiement')
const Parametre=require('../Parametre')
const DevisRecapitulator = require('../services/DevisRecapitulator');
const Fichier=require('../Fichier')
const Gamme=require('../Gamme')
const Travail=require('../Travail')
const ejs = require('ejs');
const DevisPiece=require('../DevisPiece')
const Tva=require('../Tva')
const DevisTache=require('../DevisTache')
const Piece=require('../Piece')
const cors = require('cors');
const generatePdfMake = require('../services/pdf-generator');
const Projet = require('../Projet'); 
const pdf = require('html-pdf');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const xlsx = require('xlsx');
const { parse } = require('json2csv');
const upload = multer({ storage: multer.memoryStorage() });
// Définir le chemin du répertoire contenant les fichiers
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




router.get('/send_visite_done/:visiteId/:projectID', async (req, res) => {
  const { visiteId,projectID } = req.params;

  try {
    const visite = await Visite.findByPk(visiteId);
    if (!visite) {
      return res.status(404).json({ error: 'Visite non trouvée' });
    }

    const calculator = new DevisRecapitulator();
    await calculator.initTaches();

    

     const projet = await Projet.findOne({
      where: { Id: projectID },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            {
              model: DevisTache,
              include: [Travail]
            },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ]
    });
    await projet.update({ Status: 'projet validé',VisiteFaite:1,Date_de_validation: new Date(),Valider:1,});//Valider:1, autoriser le paiement
    let nomProjet="";
    if (projet) {
      let currentYear = new Date().getFullYear();
      nomProjet = `projet HR-${currentYear}-${projet.Id}`;
    } 

    const devisList = projet.Devis

    if (!devisList || devisList.length === 0) {
      return res.status(404).json({ error: 'Aucun devis trouvé pour cette visite' });
    }
    const utilisateur = projet.Client;
    const commentaire = projet.Description;
    const email_user = utilisateur.Email;
    const pseudo = `${utilisateur.Nom} ${utilisateur.Prenom}`;

    let results = [];
    let prix_total = 0;
    let tva = 0
    let coefficient = 0

    for (const devisPiece of devisList) {
      devisPiece.VisiteFaite = 1;
      // Sauvegarder les modifications
      await devisPiece.save();
      for (const devisTache of devisPiece.DevisTaches) {
        const travail = devisTache.Travail;
        const donnees = {
          formulaire: JSON.parse(devisTache.Donnees),
          nomtache: devisTache.TravailSlug
        };

        const result = await calculator.calculer_prix(travail.ID, donnees,devisPiece.ID,devisPiece.Tva.Valeur);
        result.formule = result.formule.replace(/\n/g, '<br>');
        results.push(result);
        prix_total += parseFloat(result.prix);
        tva = (result.tva);
        coefficient = (result.coefficient);
        console.log("tva recup",tva)
        console.log("coef recup",coefficient)
         console.log("prix_total",prix_total)
      }
    }

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' à ' + new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // HTML email content
    const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailVisiteFinie.ejs');
    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      pseudo,
      devisList,
      nomProjet,
      currentDate,
      email_user,
      visite,
      results,
      prix_total,
      commentaire
    });

   

    const pdfPath = await generatePdfMake(projectID, {
      pseudo,
      devisList,
      currentDate,
      email_user,
      visite,
      results,
      prix_total,
      tva,
      coefficient
    });
    

  

    // Créer l'enregistrement dans la table Fichier
    await Fichier.create({
      Nom: `Détails des devis du projet ${projectID}.pdf`,
      Url: `/files/details_des_devis_du_projet_${projectID}.pdf`, // ou une URL accessible si disponible
      Type: 'Récapitulatif des devis',
      DateDeCreation: new Date(),
      ProjetID: projectID // associer au premier devis trouvé
    });

    // Envoi de l’email avec pièce jointe
    const mailOptions = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email_user,
      subject: `Votre devis a été validé par notre technicien`,
      html: htmlContent,
      attachments: [
        {
          filename: `Détails des devis du projet ${projectID}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: `Email + PDF envoyés pour la visite ${visiteId}` });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email ou génération du PDF :', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});



router.get('/get_paiements', async (req, res) => {
  try {
      const paiements = await Paiement.findAll();
      res.status(200).json(paiements);
  } catch (error) {
      console.error('Erreur lors de la récupération des paiements :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});

router.get('/get_all_projet_paiements/:projetID', async (req, res) => {
  try {
      const { projetID } = req.params;

      if (!projetID) {
          return res.status(400).json({ message: 'Le projetID est requis' });
      }

      const paiements = await Paiement.findAll({
          where: { projetID: projetID }
      });

      res.status(200).json(paiements);
  } catch (error) {
      console.error('Erreur lors de la récupération des paiements du devis :', error);
      res.status(500).json({ message: 'Erreur serveur', error });
  }
});


// Ajouter un paramètre
router.post('/add_parametre', async (req, res) => {
  try {
    const parametre = await Parametre.create(req.body);
    res.json(parametre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier un paramètre
router.put('/update_parametre/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Parametre.update(req.body, { where: { ID: id } });
    res.json({ message: 'Paramètre mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un paramètre
router.delete('/delete_parametre/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Parametre.destroy({ where: { ID: id } });
    res.json({ message: 'Paramètre supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un paramètre par ID
router.get('/get_parametre/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parametre = await Parametre.findByPk(id);
    res.json(parametre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_parametre_by_id_or_nom/:id?/:nom?', async (req, res) => {
  try {
    const { id, nom } = req.params;
    
    // Vérifier qu'au moins un paramètre est fourni
    if (!id && !nom) {
      return res.status(400).json({ error: "Veuillez fournir un ID ou un Nom" });
    }

    let parametre;

    // Priorité à l'ID s'il est fourni
    if (id) {
      parametre = await Parametre.findByPk(id);
    } 
    // Sinon recherche par Nom
    else if (nom) {
      parametre = await Parametre.findOne({
        where: { Nom: nom }
      });
    }

    if (parametre) {
      res.json(parametre);
    } else {
      res.status(404).json({ 
        error: "Paramètre non trouvé",
        criteres: { id, nom }
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les paramètres
router.get('/get_parametres', async (req, res) => {
  try {
    const parametres = await Parametre.findAll();
    res.json(parametres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get_devis_taches_by_travail/:travailId', async (req, res) => {
  const { travailId } = req.params;

  try {
    const taches = await DevisTache.findAll({
      where: { TravailID: travailId },
      order: [['ID', 'DESC']]
    });
    res.json(taches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches par TravailID' });
  }
});

router.get('/get_devis_tache/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tache = await DevisTache.findByPk(id);
    if (!tache) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    res.json(tache);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
});



module.exports = router;
