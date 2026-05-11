const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const Visite = require('../Visite');
const DevisCalculator = require('../services/DevisCalculator');
const DevisRecapitulator = require('../services/DevisRecapitulator');
const Tva=require('../Tva')
const Travail=require('../Travail')
const Recuperation=require('../Recuperation')
const Pointcle=require('../Pointcle')
const Avis=require('../Avis')
const Gamme=require('../Gamme')
const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')
const DevisTacheHistorique=require('../DevisTacheHistorique')
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

  





// Delete
router.delete('/delete_modele_equipement/:id', async (req, res) => {
  try {
    const modele = await ModeleEquipement.findByPk(req.params.id);
    if (modele) {
      await modele.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Modèle non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du modèle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// GET all
router.get('/get_modeles_equipement', async (req, res) => {
  try {
    const modeles = await ModeleEquipement.findAll({
      include: [
        {
          model: Equipement,
          as: 'Equipement'
        }
      ]
    });

    res.status(200).json(modeles);
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/get_prix_devis_piece/:id', async (req, res) => {
  const devisId = req.params.id;

  try {
    const devisPiece = await DevisPiece.findByPk(devisId, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        }
      ]
    });

    if (!devisPiece) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    const calculator = new DevisCalculator();
    await calculator.init();
      const travaux = devisPiece.DevisTaches
      let total=0
      setTimeout(async () => {
        let total = 0; // Initialise la variable total
        let resultats = {}; // Objet pour accumuler les résultats
      
        for (let i = 0; i < travaux.length; i++) {
          let travail = travaux[i];
          let donnees = {
            "formulaire": JSON.parse(travail.Donnees),
            "nomtache": travail.TravailSlug
          };
      
          console.log(donnees);
      
          let result = await calculator.calculer_prix(travail.TravailID, donnees,travail.DevisPieceID,devisPiece.Tva.Valeur);
          console.log("prix: ", result.prix);
          console.log("formule: ", result.formule);
      
          // Ajout du résultat sous le slug du travail dans l'objet resultats
          resultats[travail.TravailSlug] = {
            prix: parseFloat(result.prix),
            formule: result.formule
          };
      
          total += parseFloat(result.prix); // Ajoute le prix au total
        }
      
        // Envoi du JSON contenant tous les résultats après la boucle
        res.status(200).json({
          total: total,
          resultats: resultats
        });
      }, 3000);
      
  } catch (error) {
    console.error('Erreur lors de la récupération du devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/edit_devis_tache/:id', async (req, res) => {
  const { id } = req.params;
  const newDonnees = req.body;

  try {
    // Vérifier si l'enregistrement existe
    const devisTache = await DevisTache.findByPk(id);

    if (!devisTache) {
      return res.status(404).json({ error: 'DevisTache non trouvée.' });
    }

    // Mise à jour de la colonne Donnees
    devisTache.Donnees = newDonnees;

    // Sauvegarde de l'enregistrement mis à jour
    await devisTache.save();

    res.status(200).json({
      message: 'DevisTache mise à jour avec succès.',
      data: devisTache
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de DevisTache:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});


router.post('/add_devis_piece', async (req, res) => {
  const { username, ip, piece, liste_des_travaux,deviceID,UtilisateurID } = req.body;
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
  const t = await sequelize.transaction();
  
  try {

    //1 calculer les prix
    const calculator = new DevisCalculator();
    await calculator.initTaches();

    const defaulttva = await Tva.findOne({
      where: {
        Defaut: 1
      }
    });

    let total = 0;
    for (const travail of liste_des_travaux) {
      const result = await calculator.calculer_prix(travail.idtache, travail,travail.DevisPieceID,defaulttva.Valeur);
      total += parseFloat(result.prix_ht);
    }

    
    //2 eviter les doublons 2 devis meme username, ip, piece, total

    let devisPiece=null;
    
      devisPiece = await DevisPiece.create({
        Username: username,
        AdresseIP: ip,
        Date: new Date(),
        Commentaire: null,
        PieceID: piece.ID,
        Prix: total,
        UtilisateurID,
        TvaID: defaulttva.ID,
      }, { transaction: t });
    
    //creer les taches et liser au devis

    const devisTaches = await Promise.all(
      liste_des_travaux.map(async tache => {
        const result = await calculator.calculer_prix_tache(tache,null,defaulttva.Valeur);
        return {
          TravailID: tache.idtache,
          DevisPieceID: devisPiece.ID,
          TravailSlug: tache.nomtache,
          Commentaires: null,
          Prix: parseFloat(result.prix_ht),
          Donnees: tache.formulaire
        };
      })
    );

    await DevisTache.bulkCreate(devisTaches, { transaction: t });

    // ✅ Commit après tout
    await t.commit();

    const devisPieceRes = await DevisPiece.findByPk(devisPiece.ID, {
      include: [
        { model: DevisTache, include: [Travail] },
        { model: Piece },
        { model: Utilisateur }
      ]
    });
    console.log("UtilisateurID ",UtilisateurID)
    console.log("deviceID ",deviceID)

    let projet = null;
    if (UtilisateurID || deviceID) {
      //recuperer le projet meme si l'utilisateur n'est pas connecté
      //probleme deviceId change

      if (UtilisateurID) {
        projet = await Projet.findOne({
          where: {
            Status: 'visite à régler',
            Client_id: UtilisateurID
          },
          order: [['Date_de_creation', 'DESC']]
        });
      }
      if (!UtilisateurID) {
        projet = await Projet.findOne({
          where: {
            Status: 'visite à régler',
            DeviceID: deviceID,
            Client_id: null
          },
          order: [['Date_de_creation', 'DESC']]
        });
      }
      
      
      if (UtilisateurID){
        try {
          await sendDevisDetailsEmail(devisPiece.ID);
        } catch (emailError) {
          console.error('Erreur envoi email :', emailError);
        }
        const user = await Utilisateur.findByPk(UtilisateurID);
        // Vérifie s’il existe déjà un projet pour cet utilisateur
        
        if (!projet) {//si pas connecte et deviceid change
          projet = await Projet.create({
            Nom: `Projet de ${user.Nom} ${user.Prenom}`,
            Description: `Projet créé automatiquement lors d'un devis.`,
            User_id: UtilisateurID,
            Client_id: UtilisateurID,
            Date_de_creation: new Date(),
            Status: 'visite à régler',
            DeviceID: deviceID,
            Payed: 0,
            VisiteFaite: 0,
            Valider:0
            
          });
        }
        await projet.update({ Client_id: UtilisateurID,User_id:UtilisateurID,Nom: `Projet de ${user.Nom} ${user.Prenom}`, });

        //prendre les devis du projet sans UtilisateurID et ajouter UtilisateurID
        const devisDuProjet = await projet.getDevis({
          attributes: ['ID', 'UtilisateurID']
        });
        for (const devis of devisDuProjet) {
          await devis.update({ UtilisateurID });
        }



       
      }else{
        if (!projet) {
          projet = await Projet.create({
            Nom: `Projet de l'utilisateur ${deviceID}`,
            Description: `Projet créé automatiquement lors d'un devis.`,
            User_id: 0,
            Client_id: 0,
            Date_de_creation: new Date(),
            Status: 'visite à régler',
            DeviceID: deviceID,
            Payed: 0,
            VisiteFaite: 0,
            Valider:0
            
          });
        }
      }

       await ProjetDevis.create({
          projet_id: projet.Id,
          devis_id: devisPiece.ID
        });
    }

    return res.status(201).json({ message: 'Devis créé avec succès', devis: devisPieceRes });
  

  } catch (error) {
    // rollback que si la transaction est encore active
    if (!t.finished) {
      await t.rollback();
    }
    console.error('Erreur lors de la création du devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


async function sendDevisDetailsEmail( devis_id) {
  try {
    console.log("devis_id ",devis_id)
    const calculator = new DevisRecapitulator();
    await calculator.initTaches();

    // Récupérer le devis
    const devisPiece = await DevisPiece.findByPk(devis_id, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        },
        { model: Tva },
        {
          model: Utilisateur
        }
      ]
    });

    if (!devisPiece) {
      throw new Error(`Aucun devis trouvé avec l'ID: ${devis_id}`);
    }
        const email_user = devisPiece.Utilisateur.Email;
        let results = []; // Pour stocker les résultats de toutes les tâches
        let devisTaches=devisPiece.DevisTaches
        let prix_total=0;
        
    // Boucle pour traiter chaque tâche de manière dynamique
    for (let i = 0; i < devisTaches.length; i++) {
      let devisTache = devisTaches[i];
      let travail = devisTache.Travail;
      let donnees = {
        "formulaire": JSON.parse(devisTache.Donnees),
        "nomtache": devisTache.TravailSlug
      };
      
      // Calcul du prix pour chaque tâche
      let result = await calculator.calculer_prix(travail.ID, donnees,devis_id,devisPiece.Tva.Valeur);
      let formule = result.formule;
      let formuleHtml = formule.replace(/\n/g, '<br>');
      result.formule=formuleHtml;
      results.push(result); // Ajout des résultats dans le tableau
      prix_total+=parseFloat(result.prix);
      console.log(parseFloat(result.prix))
    }
            
        
        let htmlContent;
        // Obtenir la date et l'heure actuelle
        const currentDate = new Date();
        const options = {
          weekday: 'long', // Affiche le jour de la semaine
          day: '2-digit',
          month: 'long',  // Affiche le mois en toute lettre
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,  // Utilise l'heure en format 24h
        };
        
        const formattedDate = currentDate.toLocaleString('fr-FR', options);
        const dateString = formattedDate.replace(",", " à"); 
        // Si des devis sont trouvés
       
        if (devisPiece) {
       
          // Générer l'email en utilisant un template EJS avec la liste des devis
          const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailDetailsDevis.ejs');
    
          htmlContent = await ejs.renderFile(emailTemplatePath, { devisPiece,prix_total,dateString,results,email_user  });
        } 
        // Configuration de l'email
        const mailOptions = {
          from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
          to: email_user,
          subject: `Votre devis #${devisPiece.ID} est prêt !`,
          html: htmlContent
        };
    
        // Envoyer l'email
        await transporter.sendMail(mailOptions);
        // Retourner les résultats
     return {
      message: `Traitement terminé pour le devis ID: ${devisPiece.ID}`,
     
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails:', error);
    throw new Error('Erreur lors de l\'envoi des emails');
  }
   
}



router.get('/send_tasks_details_by_email/:devisID', async (req, res) => {
  const { devisID } = req.params;

  try {
    console.log("devisID ",devisID)
    const result = await sendDevisDetailsEmail(devisID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/get_devis_piece/:id', async (req, res) => {
  const devisId = req.params.id;

  try {
    const devisPiece = await DevisPiece.findByPk(devisId, {
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        },
        {
          model: Tva
        },
        {
          model: Utilisateur
        },
        { model: Utilisateur, as: 'Artisans' }
        
      ]
    });

    if (!devisPiece) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.status(200).json(devisPiece);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.post('/get_devis_piece_by_username_and_ip', async (req, res) => {
  const { username, ip } = req.body;
console.log({ username, ip })
  try {
    const devisPieces = await DevisPiece.findAll({
      where: {
        Username: username,
        AdresseIP: ip
      }
    });

    if (devisPieces.length > 0) {
      res.status(200).json(devisPieces);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving DevisPiece records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/get_no_payed_devis_piece_by_device_id/:device_id', async (req, res) => {
  const { device_id } = req.params;
  try {
     const project = await Projet.findOne({
      where: {
        Payed: 0,
        DeviceID:device_id
        
      },
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

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'No records found for the provided username and IP address' });
    }
  } catch (error) {
    console.error('Error retrieving DevisPiece records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;
