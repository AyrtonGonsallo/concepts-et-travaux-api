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
   const sequelize = require('../config/database');
  const { visiteId, projectID } = req.params;
  const transaction = await sequelize.transaction(); // 🔒 atomicité

  try {
    // --- 1. Validations d'entrée ---
    const visiteIdNum = Number(visiteId);
    const projectIDNum = Number(projectID);
    if (!Number.isInteger(visiteIdNum) || !Number.isInteger(projectIDNum)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Paramètres invalides' });
    }

    const visite = await Visite.findByPk(visiteIdNum, { transaction });
    if (!visite) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Visite non trouvée' });
    }

    const projet = await Projet.findOne({
      where: { Id: projectIDNum },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Visite },
        {
          model: DevisPiece,
          as: 'Devis',
          include: [
            { model: DevisTache, include: [Travail] },
            { model: Tva },
            { model: Piece },
            { model: Utilisateur }
          ]
        }
      ],
      transaction
    });

    if (!projet) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // --- 2. Recalcul des prix AVANT de calculer le total ---
    const calculator = new DevisRecapitulator();
    await calculator.initTaches();

    const devisList = projet.Devis || [];
    if (devisList.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Aucun devis trouvé pour cette visite' });
    }

    let results = [];
    let totalRecalcule = 0;
    let tva = 0;
    let coefficient = 0;

    for (const devisPiece of devisList) {
      let totalDevisTTC = 0;
      let totalDevisHT  = 0;
      let tvaPiece  = null;
      let coefPiece = null;
      let hasLigneValide = false;

      for (const devisTache of devisPiece.DevisTaches) {
        const travail = devisTache.Travail;
        if (!travail) {
          console.warn(`⚠️ DevisTache ${devisTache.ID} sans Travail associé, ignorée`);
          continue;
        }

        let donnees;
        try {
          donnees = {
            formulaire: JSON.parse(devisTache.Donnees || '{}'),
            nomtache: devisTache.TravailSlug
          };
        } catch (e) {
          console.warn(`⚠️ Donnees invalides pour DevisTache ${devisTache.ID}:`, e.message);
          continue;
        }

        const tvaValeur = Number(devisPiece.Tva?.Valeur);
        if (!Number.isFinite(tvaValeur)) {
          console.warn(`⚠️ TVA invalide pour DevisPiece ${devisPiece.ID}`);
          continue;
        }

        const result = await calculator.calculer_prix(
          travail.ID, donnees, devisPiece.ID, tvaValeur
        );
        if (!result) continue;

        result.formule = (result.formule || '').replace(/\n/g, '<br>');
        results.push(result);

        // --- Parse robuste ---
        const prixTTC = parseFloat(result.prix);
        if (!Number.isFinite(prixTTC) || prixTTC < 0) {
          console.warn(`⚠️ Prix invalide pour DevisTache ${devisTache.ID}: ${result.prix}`);
          continue;
        }

        // --- TVA en coefficient (1.2, 1.1, 1.055…) ---
        const tvaCoefLigne = Number(result.tva);
        if (!Number.isFinite(tvaCoefLigne) || tvaCoefLigne <= 0) {
          console.warn(`⚠️ TVA (coef) invalide pour DevisTache ${devisTache.ID}: ${result.tva}`);
          continue;
        }

        // --- Coefficient commercial optionnel ---
        const coefLigne = Number(result.coefficient);
        const coefLigneValide = Number.isFinite(coefLigne) && coefLigne > 0 ? coefLigne : 1;

        // --- HT par ligne : on divise par la TVA uniquement ---
        const prixHTLigne = prixTTC / tvaCoefLigne / coefLigne;

        // --- Cohérence : toutes les lignes d'un devis doivent avoir le même coef TVA
        //     (sinon on ne peut pas stocker un seul prix HT fiable)
        if (tvaPiece === null) {
          tvaPiece = tvaCoefLigne;
        } else if (Math.abs(tvaPiece - tvaCoefLigne) > 0.0001) {
          console.warn(
            `⚠️ DevisPiece ${devisPiece.ID} : TVA mixte (${tvaPiece} vs ${tvaCoefLigne}). ` +
            `Le prix HT global sera approximatif.`
          );
        }

        coefPiece = coefLigneValide;
        totalDevisTTC += prixTTC;
        totalDevisHT  += prixHTLigne;
        hasLigneValide = true;

        console.log('result', { prixTTC, tvaCoefLigne, coefLigneValide, prixHTLigne });
      }

      // --- Garde-fou : pas de mise à jour si aucune ligne valide ---
      if (!hasLigneValide || totalDevisHT <= 0) {
        console.warn(`⚠️ DevisPiece ${devisPiece.ID} : aucun prix HT calculable, sauvegarde ignorée`);
        continue;
      }

      // --- Arrondi à 2 décimales ---
      const prixHTArrondi = Math.round(totalDevisHT * 100) / 100;

      // --- Mise à jour ---
      devisPiece.VisiteFaite = 1;
      devisPiece.Prix = prixHTArrondi;
      await devisPiece.save({ transaction });

      console.log(`✅ DevisPiece ${devisPiece.ID} : HT = ${prixHTArrondi}, TTC = ${Math.round(totalDevisTTC * 100) / 100}`);

      // --- Cumul global ---
      totalRecalcule += totalDevisTTC;
      if (tvaPiece !== null) tva = tvaPiece;
      if (coefPiece !== null) coefficient = coefPiece;
    }

    // --- Arrondi final du total global ---
    totalRecalcule = Math.round(totalRecalcule * 100) / 100;

    console.log('TOTAL TTC =', totalRecalcule);
    console.log('TVA (coef) =', tva);
    console.log('Coefficient =', coefficient);

    // --- 4. Arrondi à 2 décimales en NUMBER ---
    totalRecalcule = Math.round(totalRecalcule * 100) / 100;

    



    if (totalRecalcule <= 0) {
      await transaction.rollback();
      console.error(`❌ Total du projet ${projectID} = ${totalRecalcule}, acompte annulé`);
      return res.status(422).json({
        error: 'Le montant total du devis est nul ou invalide. Vérifiez les prix des tâches.'
      });
    }

    // --- 5. Validation du paramètre acompte ---
    const parametre_acompte = await Parametre.findByPk(2, { transaction });
    if (!parametre_acompte) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Paramètre acompte (ID 2) introuvable' });
    }

    const pourcent_acompte = Number(parametre_acompte.Valeur);
    if (!Number.isFinite(pourcent_acompte) || pourcent_acompte < 0 || pourcent_acompte > 100) {
      await transaction.rollback();
      return res.status(500).json({
        error: `Pourcentage d'acompte invalide : ${parametre_acompte.Valeur}`
      });
    }

   

    // --- 6. Calcul acompte en NUMBER, arrondi propre ---
    const prix_acompte = Math.round(((totalRecalcule * pourcent_acompte) / 100) * 100) / 100;

     console.log('prix_acompte',prix_acompte)
     console.log('totalRecalcule',totalRecalcule)
     console.log('pourcent_acompte',pourcent_acompte)

    if (prix_acompte <= 0) {
      await transaction.rollback();
      console.error(`❌ Acompte calculé = 0 (total=${totalRecalcule}, %=${pourcent_acompte})`);
      return res.status(422).json({
        error: `Acompte calculé invalide : total=${totalRecalcule}, pourcentage=${pourcent_acompte}`
      });
    }

    // --- 7. Remplacement du paiement acompte en transaction ---
    const paiementExistant = await Paiement.findOne({
      where: { ProjetID: projectIDNum, Type: 'acompte', Requette: 'reglement', Status: 0 },
      transaction
    });
    if (paiementExistant) {
      await paiementExistant.destroy({ transaction });
    }

    await Paiement.create({
      TypeDePaiement: null,
      Type: 'acompte',
      Montant: prix_acompte,       // ✅ number
      Date: new Date(),
      DatedePaiement: null,
      ProjetID: projectIDNum,
      Titre: `acompte du projet ${projectIDNum}`,
      Requette: 'reglement',
      Status: 0
    }, { transaction });

    // --- 8. Mise à jour projet ---
    await projet.update(
      {
        Status: 'projet validé',
        VisiteFaite: 1,
        Date_de_validation: new Date(),
        Valider: 1
      },
      { transaction }
    );

    // --- 9. Reste du traitement (email/PDF) ---
    const currentYear = new Date().getFullYear();
    const nomProjet = `projet HR-${currentYear}-${projet.Id}`;
    const utilisateur = projet.Client;
    if (!utilisateur || !utilisateur.Email) {
      await transaction.rollback();
      return res.status(422).json({ error: 'Client ou email manquant' });
    }
    const commentaire = projet.Description;
    const email_user = utilisateur.Email;
    const pseudo = `${utilisateur.Nom} ${utilisateur.Prenom}`;

    const currentDate =
      new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' +
      new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });

    // ⚠️ Commit AVANT les IO (email/PDF) pour ne pas bloquer la DB
    await transaction.commit();

    // --- 10. Email + PDF hors transaction ---
    const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailVisiteFinie.ejs');
    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      pseudo, devisList, nomProjet, currentDate, email_user, visite, results,
      prix_total: totalRecalcule, commentaire
    });

    const pdfPath = await generatePdfMake(projectIDNum, {
      pseudo, devisList, currentDate, email_user, visite, results,
      prix_total: totalRecalcule, tva, coefficient
    });

    await Fichier.create({
      Nom: `Détails des devis du projet ${projectIDNum}.pdf`,
      Url: `/files/details_des_devis_du_projet_${projectIDNum}.pdf`,
      Type: 'Récapitulatif des devis',
      DateDeCreation: new Date(),
      ProjetID: projectIDNum
    });

    await transporter.sendMail({
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email_user,
      subject: `Votre devis a été validé par notre technicien`,
      html: htmlContent,
      attachments: [{
        filename: `Détails des devis du projet ${projectIDNum}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }]
    });

    return res.status(200).json({
      success: true,
      message: `Email + PDF envoyés pour la visite ${visiteId}`,
      total: totalRecalcule,
      acompte: prix_acompte
    });

  } catch (error) {
    try { await transaction.rollback(); } catch (_) {}
    console.error('Erreur lors de l\'envoi de l\'email ou génération du PDF :', error);
    return res.status(500).json({ success: false, error: 'Erreur serveur' });
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
