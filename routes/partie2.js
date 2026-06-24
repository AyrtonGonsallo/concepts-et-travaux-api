const express = require('express');
const router = express.Router();
const Role = require('../Role');
const crypto = require('crypto');
const Utilisateur = require('../Utilisateur');
const DevisCalculator = require('../services/DevisCalculator');
const DevisRecapitulator = require('../services/DevisRecapitulator');
const Tva=require('../Tva')
const Travail=require('../Travail')
const Recuperation=require('../Recuperation')
const Visite=require('../Visite')
const Paiement=require('../Paiement')
const Projet=require('../Projet')
const ejs = require('ejs');
const Piece=require('../Piece')
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')
const cors = require('cors');




const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const { Op,Sequelize } = require('sequelize');



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

  
  

router.post('/create-checkout-session', async (req, res) => {
  try {
    require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { montant, liste_devis, url_de_retour, payer_visite,payer_acompte, } = req.body;
    // Récupération des IDs des devis dans un tableau
    const devisIds = liste_devis.map(devis => devis.ID);
    let desc="";
    if(payer_visite){
      desc="Ce montant correspond aux frais de visite du technicien qui viendra valider votre demande de devis."
    }else if (payer_acompte){
      desc=`Ce montant correspond à un acompte sur les ${liste_devis.length} devis (nº${devisIds.join(', nº')}) qui vous ont été transmis par email et que vous pouvez retrouver sur votre compte Homeren.`
    }
    if (!montant || !liste_devis || liste_devis.length === 0) {
      return res.status(400).json({ error: "Montant et liste_devis sont requis" });
    }



    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              //name: `${liste_devis.length} devis`,
              name: `Montant à régler :`,
              description:desc,
              //description: `Paiement pour ${liste_devis.length} devis d'un montant total de ${montant}€`,
              //images: ['https://homeren.fr/assets/logo-homeren-jn.webp'],
            },
            unit_amount: Math.round(montant * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${url_de_retour}panier?checkout=1&session_id={CHECKOUT_SESSION_ID}&visite=${payer_visite}&acompte=${payer_acompte}`,
      cancel_url: `${url_de_retour}panier?checkout=-1&visite=${payer_visite}&acompte=${payer_acompte}`,
      metadata: { liste_devis: liste_devis.map(devis => devis.ID).join(",") }, // Stocker les IDs sous forme de chaîne
    });

    res.json({ url: session.url });
   
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-payed-devis', async (req, res) => {
  try {

    const { projet_id,prix_acompte  } = req.body;
    // Extraire uniquement les IDs
    
    try {
      const project = await Projet.findOne({
        where: { Id: projet_id },
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

      if (!project) {
        console.warn('Projet non trouvé.');
        return res.status(404).json({ error: 'Projet introuvable' });
      }
      await Projet.update({ Payed: 1,Status:'acompte payé',Date_de_paiement_acompte: new Date()}, { where: { Id: projet_id } });
      

      await Paiement.create({
            TypeDePaiement: 'en ligne', // Ou 'virement' selon votre logique
            Type: 'acompte',
            Montant: prix_acompte,
            Date: new Date(),
            ProjetID: projet_id,
            Titre: `acompte du projet ${projet_id}`,
            Requette:"reglement",
            Status:1,
        });
      

      console.log('Paiements créé avec succès.');


    } catch (err) {
      console.error('Erreur mise à jour devis :', err);
    }
    res.json({ success: true, message: "Mise à jour réussie", updatedProjet: projet_id });

  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-visited-devis', async (req, res) => {
  try {

    const { projet_id,prix_visite  } = req.body;
    const project = await Projet.findOne({
    where: { Id: projet_id },
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

  if (!project) {
    console.warn('Projet non trouvé.');
    return res.status(404).json({ error: 'Projet introuvable' });
  }

  // Extraire les IDs de devis liés
  const devisIDs = project.Devis?.map(devis => devis.ID) || [];

  // Créer la visite
  const newVisite = await Visite.create({ Date: new Date(), Paye: 1 });

  // Mettre à jour le projet
  await project.update({ VisiteID: newVisite.ID });
  console.log(`Projet ${project.Id} mis à jour avec la Visite ${newVisite.ID}`);

  // Créer un paiement lié au projet (visite)
  const paiement = await Paiement.create({
    TypeDePaiement: 'en ligne', // Ou 'virement' selon ta logique
    Type: 'visite',
    Montant: prix_visite,
    Date: new Date(),
    ProjetID: project.Id,
     Titre: `visite du projet ${projet_id}`,
      Requette:"reglement",
      Status:1,
  });



  console.log('Visite et paiement créés avec succès.');
  return res.status(200).json({
    success: true,
    message: 'Visite et paiement enregistrés.',
    visiteID: newVisite.ID,
    paiementID: paiement.ID,
    devis: devisIDs
  });

  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});



router.post('/get_paiement', async (req, res) => {
  //const { montant, source } = req.body;
  const stripe = require('stripe')('sk_test_51R1pR3EDZMIS8WcNRA3mfHVgdM9I7UzIimfm00XwUcHMVeAu3jUIy2EFKtESsm9Ees8hCwO7j7SIuYFXqvdMOO0V00O02dyg9A');
  const amount = req.body?.data?.amount || 1000;
    try {
        //create stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Test payment',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${'http://109.234.166.164:4300'}/stripe-successful-payment?hash=hash`,
            cancel_url: `${'http://109.234.166.164:4300'}/stripe-canceled-payment?hash=hash`,
            expand: ['payment_intent']
        });

        return res.send(session);
    } catch (err) {
        console.log('stripe error', err);
    }
});

router.get('/send-account-creation-email/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    // Récupérer les devis non payés associés au DeviceID
    const utilisateur = await Utilisateur.findOne({
      where: {
        Id: userid
      },
      include: Role // Inclure les grades associés à l'utilisateur
    });

    let htmlContent;
    // Obtenir la date et l'heure actuelle
    const currentDate = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    // Si des devis sont trouvés
    if (utilisateur) {
      // Générer l'email en utilisant un template EJS avec la liste des devis
      const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailBienvenue.ejs');
      htmlContent = await ejs.renderFile(emailTemplatePath, { utilisateur,currentDate  });
    } 

    // Configuration de l'email
    const mailOptions = {
      from: 'gestion@homeren.fr',
      to: 'ayrtongonsallo444@gmail.com',
      subject: 'Votre compte sur Homeren a été créé !',
      html: htmlContent
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    res.send(`Email de bienvenue envoyé a l'utilisateur: ${userid}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).send('Erreur lors de l\'envoi de l\'email');
  }
});

router.get('/send-devis-details-email/:devistacheID', async (req, res) => {
  const { devistacheID } = req.params;

  try {

    
    // Récupérer les devis non payés associés au DeviceID
    const devisTache = await DevisTache.findOne({
      where: {
        ID: devistacheID
      },
      include: [
        {
          model: Travail
        },
        
      ]
    });

     const devisPiece = await DevisPiece.findByPk(devisTache.DevisPieceID, {
      include: [
        { model: Tva }
      ]
    });

    const calculator = new DevisCalculator();
    await calculator.initTaches();
    let travail = devisTache.Travail;
    let donnees = {
      "formulaire": JSON.parse(devisTache.Donnees),
      "nomtache": devisTache.TravailSlug
    };
    let results = await calculator.calculer_prix(travail.ID, donnees,devisPiece.Tva.Valeur);
        
    
    let htmlContent;
    // Obtenir la date et l'heure actuelle
    const currentDate = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    // Si des devis sont trouvés
    const email_user = "psychopathvssociopathe@gmail.com";
    if (devisTache) {
      const formule = results.formule;
      const formuleHtml = formule.replace(/\n/g, '<br>');
      
      // Générer l'email en utilisant un template EJS avec la liste des devis
      const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailDetailsTravail.ejs');

      htmlContent = await ejs.renderFile(emailTemplatePath, { devisTache,currentDate,formuleHtml,email_user  });
    } 
    // Configuration de l'email
    const mailOptions = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email_user,
      subject: `Votre devis #${devistacheID} est prêt !`,
      html: htmlContent
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    res.send(`Email envoyé pour le devis tache: ${devistacheID}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).send('Erreur lors de l\'envoi de l\'email');
  }
});



router.get('/send-devis-piece-details-email/:devispieceID', async (req, res) => {
  const { devispieceID } = req.params;

  try {

    const calculator = new DevisRecapitulator();
    await calculator.initTaches();
    // Récupérer les devis non payés associés au DeviceID
    const devisPiece = await DevisPiece.findOne({
      where: {
        ID: devispieceID
      },
      include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        },
        {
          model: Utilisateur
        },
        
      ]
    });

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
  let result = await calculator.calculer_prix(travail.ID, donnees,devisPiece.Tva.Valeur);
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
    const email_user = "ayrtongonsallo444@gmail.com";
   
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
    res.send(`Email envoyé pour le devis tache: ${devispieceID}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).send('Erreur lors de l\'envoi de l\'email');
  }
});

// Endpoint pour envoyer un e-mail
router.get('/test-email', (req, res) => {
  // Récupérer les informations de l'e-mail à partir de la requête
  

  // Définir les options de l'e-mail
  const mailOptions = {
    from: 'gestion@homeren.fr',
    to: "ayrtongonsallo444@gmail.com",
    subject: "subject",
    text: "text"
  };

  // Envoyer l'e-mail
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.status(500).send('Erreur lors de l\'envoi de l\'e-mail');
    } else {
      console.log('E-mail envoyé: ' + info.response);
      res.status(200).send('E-mail envoyé avec succès');
    }
  });
});

router.post('/change_user_password', async (req, res) => {
  try {
      // Vérifiez si req.body est défini et non vide
      if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: 'Le corps de la requête est vide ou malformé' });
      }

      // Extraire les données de la requête
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe dans la base de données
      const user = await Utilisateur.findOne({ where: { email: email } });

      if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Mettre à jour le mot de passe de l'utilisateur
      await user.update({ Password: hashedPassword });

      res.status(200).json({ message: 'Mot de passe mis à jour avec succès' }); // Renvoie un message de succès
  } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
  }
});

function generateRandomPassword(length) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

router.get('/reset_password_form', async (req, res) => {
  const { uid, error, success } = req.query;

  // Vérification si 'uid' est fourni
  if (!uid) {
    return res.status(400).json({ error: 'Paramètre uid requis' });
  }

  try {
    // Recherche de l'entrée avec la date d'expiration la plus proche et qui n'a pas été utilisée
    const recuperation = await Recuperation.findOne({
      where: {
        UserId: uid,
        ExpirationDate: {
          [Op.gt]: new Date() // Filtrer uniquement les entrées non expirées
        },
      },
      order: [['ExpirationDate', 'ASC']] // Trier pour prendre la plus proche
    });

    if (!recuperation && !(error || success)) {
      return res.status(404).json({ error: 'Lien de récupération invalide ou expiré' });
    }

    const formPath = path.join(__dirname, '..','form-templates', 'formRecuperation.ejs');
    res.render(formPath, { errorMessage: error || null, successMessage: success || null });

  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




router.post('/reset_password_form/', async (req, res) => {
  try {
    console.log(req.body)
    const { email, password, confirmPassword } = req.body;
    // Vérification des champs
    if (!email || !password || !confirmPassword) {
      return res.redirect('https://dev.homeren.fr/api-concepts-et-travaux/reset_password_form/?uid=0&error=Tous les champs sont obligatoires');
    }


    // Vérification que les mots de passe sont identiques
    if (password !== confirmPassword) {
      return res.redirect('https://dev.homeren.fr/api-concepts-et-travaux/reset_password_form/?uid=0&error=Les mots de passe ne correspondent pas.');
    }

    // Vérification que l'email existe dans la base de données
    const user = await Utilisateur.findOne({ where: { email } });
    
    if (!user) {
      return res.redirect('https://dev.homeren.fr/api-concepts-et-travaux/reset_password_form/?uid=0&error=Utilisateur non trouvé.');
    }
    let uid=user.Id
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Mettre à jour le mot de passe dans la base de données
    await user.update({ Password: hashedPassword });
    await Recuperation.destroy({
      where: {
        UserId: uid
      }
    });
    // Retourner une réponse de succès
    return res.redirect('https://dev.homeren.fr/api-concepts-et-travaux/reset_password_form/?uid='+uid+'&success=Votre mot de passe à été réinitialisé avec succès.');

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return res.redirect('https://dev.homeren.fr/api-concepts-et-travaux/reset_password_form/?uid=0&error=Erreur lors de la réinitialisation du mot de passe:'+error);
  }
});


router.get('/restore_user_password/:email', async (req, res) => {
  try {
    const email = req.params.email; // Récupérez l'email de l'URL

    const user = await Utilisateur.findOne({
      where: {
        email: {
          [Op.like]: `%${email}%`
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Créez une nouvelle entrée dans la table Recuperation
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Expiration dans 1 heure

    const recuperation = await Recuperation.create({
      ExpirationDate: expirationDate,
      UserId: user.Id // Assurez-vous que l'attribut correspond à votre modèle Utilisateur
    });
    const currentDate = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    let uid=user.Id
    const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailRecuperation.ejs');
    // Préparer les données pour l'e-mail
    const mailData = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email,
      subject: 'Confirmation de la réinitialisation du mot de passe',
      // Utilisation de EJS pour le contenu dynamique
      

      html: await ejs.renderFile(emailTemplatePath, { currentDate,email,uid })
    };

    // Envoyer l'e-mail de notification
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail' });
      }
      console.log('E-mail envoyé :', info.response);
      res.status(200).json({ message: 'Mot de passe mis à jour avec succès et e-mail envoyé' });
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
  }
});

module.exports = router;
