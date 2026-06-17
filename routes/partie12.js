const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const RoleAutorisation = require('../RoleAutorisation');
const DevisCalculator = require('../services/DevisCalculator');

const Tva=require('../Tva')
const Fichier=require('../Fichier')
const Visite=require('../Visite')

const Travail=require('../Travail')

const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')

const Realisation=require('../Realisation')
const Piece=require('../Piece')
const ProjetDevis = require('../ProjetDevis');
const cors = require('cors');
const Projet = require('../Projet'); 
const Autorisation = require('../Autorisation'); // Importez le modèle Grade
const pdf = require('html-pdf');
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

  





router.post('/get_prix_devis_tache/', async (req, res) => {
  

  try {
    const tache =  req.body;

    const devisTache = await DevisTache.findByPk(tache.ID);

    if (!devisTache) {
      return res.status(404).json({ error: 'Devis tache non trouvé' });
    }

     const devisPiece = await DevisPiece.findByPk(tache.DevisPieceID, {
      include: [
        { model: Tva }
      ]
    });

    const calculator = new DevisCalculator();
    await calculator.initTaches();
      let total=0
      setTimeout(async () => {
        let total = 0; // Initialise la variable total
        let resultats = {}; // Objet pour accumuler les résultats
      
        
          let donnees = {
            "formulaire": (tache.Donnees),
            "nomtache": tache.TravailSlug
          };
      
          console.log(donnees);
      
          let result = await calculator.calculer_prix(
              tache.TravailID,
              donnees,
              tache.DevisPieceID,
              devisPiece.Tva.Valeur
          );
          console.log("prix: ", result.prix);
          console.log("tva: ", devisPiece.Tva.Valeur);
          console.log("formule: ", result.formule);
          console.log("prix_marge: ", result.prix_marge);
          console.log("formule_marge: ", result.formule_marge);
      
          // Ajout du résultat sous le slug du travail dans l'objet resultats
          resultats[tache.TravailSlug] = {
            prix: parseFloat(result.prix),
            formule: result.formule,
            prix_marge: parseFloat(result.prix_marge),
            formule_marge: result.formule_marge
          };
      
          total += parseFloat(result.prix); // Ajoute le prix au total


          let prix_coutant_ht=result.prix_marge_ht
          if(prix_coutant_ht){
            devisTache.PrixCoutant = prix_coutant_ht;
          await devisTache.save();
          }

          
        
      
        // Envoi du JSON contenant tous les résultats après la boucle
        res.status(200).json({
          total: total,
          resultats: resultats
        });
      }, 1000);
      
  } catch (error) {
    console.error('Erreur lors de la récupération du devis tache :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.get('/send_visite_scheduled/:visiteId/:projectId/:sendEmail', async (req, res) => {
  const { visiteId,projectId,sendEmail } = req.params;

  try {
    const visite = await Visite.findByPk(visiteId);
    if (!visite) {
      return res.status(404).json({ error: 'Visite non trouvée' });
    }

    

    const projet = await Projet.findOne({
      where: { Id: projectId },
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
    await projet.update({ Status: 'visite programmée' });
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
      const pseudo = `${utilisateur.Nom} ${utilisateur.Prenom}`;
      const email_user = utilisateur.Email;
      const sendEmailBool =
      sendEmail === true ||
      sendEmail === 'true' ||
      sendEmail === 1 ||
      sendEmail === '1';

      console.log('sendEmail =', sendEmailBool, 'type =', typeof sendEmailBool);
      if(sendEmailBool){
        console.log("email a envoyer")
        const currentDate = new Date().toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailVisiteProgrammee.ejs');
        const htmlContent = await ejs.renderFile(emailTemplatePath, {
          pseudo,
          devisList,
          currentDate,
          nomProjet,
          email_user,
          visite,
          commentaire
        });

        const mailOptions = {
          from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
          to: email_user,
          subject: `La visite du technicien a été programmée`,
          html: htmlContent
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: `Email envoyé pour la programmation de la visite ${visiteId}` });
      }else{
        console.log("pas d'email a envoyer")
        res.status(200).json({ success: true, message: `programmation de la visite ${visiteId}. Aucun email envoyé` });
      }

    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi de l\'email' });
  }
});




router.get('/get_fichiers', async (req, res) => {
  try {
    const fichiers = await Fichier.findAll({
      include: [
        {
          model: Projet,
          as: 'Projet',
          include: [
            {
              model: Utilisateur,
              as: 'Utilisateur'
            }
          ]
        }
      ]
    });

    res.status(200).json(fichiers);
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.get('/get_fichiers_by_projet/:projetID', async (req, res) => {
  const { projetID } = req.params;

  try {
    const fichiers = await Fichier.findAll({
      where: { ProjetID: projetID }
    });

    res.status(200).json(fichiers);
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


router.delete('/delete_fichier/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const fichier = await Fichier.findByPk(id);
    if (!fichier) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    await fichier.destroy();
    res.status(200).json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post("/update_project_status", async (req, res) => {
  const {
    projet_id,
    paiement_visite,
    programmation_visite,
    projet_valide,
    paiement_autorise,
    acompte_paye,
    travaux_demarres,
    travaux_en_cours,
    travaux_acheves,
    travaux_livres,
    gpa_termine,
    notes_remarques,
    Date_de_fin_des_travaux,
    Date_de_fin_gpa,
    Date_paiement_visite,
    Date_programmation_visite,
    Date_validation_projet,
    Date_paiement_acompte,
    Avancement

  } = req.body;
  const sequelize = require('../config/database');
  const t = await sequelize.transaction();

  try {
   const projet = await Projet.findByPk(projet_id, {
  include: [
    { model: Visite }
  ]
});


    if (!projet) return res.status(404).json({ message: "Projet non trouvé" });
    let status_actuel = gpa_termine ? 'gpa terminé' :
        travaux_livres ? 'travaux livrés' :
        travaux_acheves ? 'travaux achevés' :
        travaux_en_cours ? 'travaux en cours' :
        travaux_demarres ? 'travaux démarrés' :
        acompte_paye ? 'acompte payé' :
        projet_valide ? 'projet validé' :
        programmation_visite ? 'visite programmée' :
        paiement_visite ? 'visite réglée' :
        'visite à régler';

    const updateFields = {
      Status: status_actuel,
      Valider: paiement_autorise,
      Description: notes_remarques,
      Payed:acompte_paye ? true :false,
      Date_de_fin_des_travaux: Date_de_fin_des_travaux,
      Date_de_fin_gpa: Date_de_fin_gpa,
      Date_de_validation:Date_validation_projet,
      Date_de_paiement_acompte:Date_paiement_acompte,
      ProgressionTravaux:Avancement
    };

   

    

    await projet.update(updateFields, { transaction: t });

    if (projet.Visite && status_actuel=="visite réglée") {
      console.log("Date_paiement_visite:", Date_paiement_visite);
      console.log("Date_programmation_visite:", Date_programmation_visite);

      const updateFields2 = {};

      if (Date_paiement_visite) {
        updateFields2.Date = Date_paiement_visite;
      }

      if (Date_programmation_visite) {
        updateFields2.DateDeProgrammation = Date_programmation_visite;
      }

      await projet.Visite.update(updateFields2, { transaction: t });

    } else if (paiement_visite && !projet.Visite) {

      // Création de la visite avec transaction
      const newVisite = await Visite.create(
        {
          Date: Date_paiement_visite || null,
          DateDeProgrammation: Date_programmation_visite || null,
          Paye: 1,
        },
        { transaction: t }
      );

      // Mise à jour du projet avec la FK
      await projet.update(
        { VisiteID: newVisite.ID },
        { transaction: t }
      );

      console.log(`Projet ${projet.Id} mis à jour avec la Visite ${newVisite.ID}`);
    }

    else if (status_actuel=="visite à régler" && projet.Visite) {

       const visiteId = projet.Visite.ID;
      // 1️⃣ Supprimer la relation dans le projet (FK à null)
      await projet.update(
        { VisiteID: null },
        { transaction: t }
      );

      // 2️⃣ Supprimer la visite
      await projet.Visite.destroy({ transaction: t });

      console.log(`Visite ${visiteId} supprimée du projet ${projet.Id}`);

    }


  

    await t.commit();
    return res.json({ message: "Projet mis à jour avec succès", projet_id: projet.Id });
  } catch (error) {
    await t.rollback();
    console.error("Erreur update projet :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

router.get('/get_projet_by_devis/:devisId', async (req, res) => {
  const { devisId } = req.params;

  try {
    const devis = await DevisPiece.findByPk(devisId, {
      include: [
        {
          model: Projet,
          through: { attributes: [] } // pour ne pas inclure les données de ProjetDevis
        }
      ]
    });

    if (!devis || !devis.Projets || devis.Projets.length === 0) {
      return res.status(404).json({ message: "Aucun projet lié à ce devis." });
    }

    // On retourne tous les projets liés si plusieurs (array), ou le premier seulement
    return res.status(200).json({ projets: devis.Projets });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet lié au devis :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});








module.exports = router;
