const express = require('express');
const router = express.Router();
const Role = require('../Role');
const Utilisateur = require('../Utilisateur');
const RoleAutorisation = require('../RoleAutorisation');
const Parametre = require('../Parametre');

const Gamme=require('../Gamme')
const ejs = require('ejs');
const TacheGenerale=require('../TacheGenerale')
const DevisPiece=require('../DevisPiece')

const ProjetDevis = require('../ProjetDevis');
const cors = require('cors');
const Projet = require('../Projet'); 
const Autorisation = require('../Autorisation'); // Importez le modèle Grade




const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de "sauts" pour générer le sel

const nodemailer = require('nodemailer');


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

  


// Endpoint POST pour ajouter un utilisateur
router.post('/add_utilisateur', async (req, res) => {
  try {
      // Récupérer les données de la requête
      const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email,Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis,CategorieArtisan,CategorieFournisseur } = req.body;
// Hasher le mot de passe
const hashedPassword = await bcrypt.hash(Password, saltRounds);
      // Créer un nouvel utilisateur dans la base de données
      const utilisateur = await Utilisateur.create({
          RaisonSociale,
          NumeroSIRET,
          Nom,
          Prenom,
          Email,
          Password: hashedPassword,
          Telephone,
          AdressePostale,
          Activite,
          CA,
          Effectif,
          References,
          QuestionnaireTarif,
          AssuranceRCDecennale,
          KBis,
          CategorieArtisan,
          CategorieFournisseur
      });

      // Répondre avec l'utilisateur ajouté
      res.status(201).json(utilisateur);
  } catch (error) {
      // En cas d'erreur, répondre avec le code d'erreur 500
      console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

 
// Endpoint POST pour ajouter un utilisateur
router.post('/add_front_utilisateur', async (req, res) => {
  try {
     // Récupérer les données de la requête
    const {  nom, prenom, email, password, phoneNumber, AdressePostale, CodePostal,CommunePostale,roleId,deviceID,Agree } = req.body;

     // Vérifier si l'email existe déjà dans la base de données
     const existingUserByEmail = await Utilisateur.findOne({ where: { Email: email } });

     if (existingUserByEmail) {
       return res.status(400).json({ error: 'Un utilisateur avec cette adresse email existe déjà.' });
     }
    // Vérifier si l'ID du rôle est fourni dans le corps de la requête
    if (!roleId) {
      return res.status(400).json({ error: 'ID du rôle manquant dans la requête' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer un nouvel utilisateur dans la base de données avec son rôle
    const utilisateur = await Utilisateur.create({
      Nom:nom,
      Prenom:prenom,
      Email:email,
      Password: hashedPassword,
      Telephone:phoneNumber,
      AdressePostale,
      CommunePostale,
      CodePostal,
      DeviceID:deviceID,
      RoleId:roleId // Associer l'ID du rôle à l'utilisateur
    });
     utilisateur2 = await Utilisateur.findOne({
      where: {
        Id: utilisateur.Id
      },
      include: Role // Inclure les grades associés à l'utilisateur
    });
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
    if (utilisateur2) {
      // Générer l'email en utilisant un template EJS avec la liste des devis
      const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailBienvenue.ejs');
      htmlContent = await ejs.renderFile(emailTemplatePath, { utilisateur2,dateString  });
    } 

    // Configuration de l'email
    const mailOptions = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email,
      subject: 'Votre compte sur Homeren a été créé !',
      html: htmlContent
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

      // Répondre avec l'utilisateur ajouté
      res.status(201).json(utilisateur);
  } catch (error) {
      // En cas d'erreur, répondre avec le code d'erreur 500
      console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.post('/add_front_utilisateur_with_datas', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { email, password, deviceID } = req.body;

    // Vérifier si l'email existe déjà dans la base de données
    const existingUserByEmail = await Utilisateur.findOne({ where: { Email: email } });

    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Vérifier si le deviceID existe déjà dans la base de données
    const existingUserByDeviceID = await Utilisateur.findOne({ where: { DeviceID: deviceID } });

    if (existingUserByDeviceID) {
      return res.status(400).json({ error: 'Un utilisateur avec ce deviceID existe déjà.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer un nouvel utilisateur dans la base de données avec son rôle
    const utilisateur = await Utilisateur.create({
      Nom: email,
      Prenom: email,
      Email: email,
      Password: hashedPassword,
      Telephone: "0032323232",
      AdressePostale: "",
      CommunePostale: "",
      CodePostal: "",
      DeviceID: deviceID,
      RoleId: 3 // Associer l'ID du rôle à l'utilisateur
    });
    utilisateur2 = await Utilisateur.findOne({
      where: {
        Id: utilisateur.Id
      },
      include: Role // Inclure les grades associés à l'utilisateur
    });
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
    if (utilisateur2) {
      // Générer l'email en utilisant un template EJS avec la liste des devis
      const emailTemplatePath = path.join(__dirname, '..','mails-templates', 'emailBienvenue.ejs');
      htmlContent = await ejs.renderFile(emailTemplatePath, { utilisateur2,dateString  });
    } 

    // Configuration de l'email
    const mailOptions = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email,
      subject: 'Votre compte sur Homeren a été créé !',
      html: htmlContent
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);
    // Répondre avec l'utilisateur ajouté
    res.status(201).json(utilisateur);

  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


function cleanFilePath(filePath) {
  if(filePath){
    return filePath.replace(/^.*\\fakepath\\/, '');
  }
  else return '';
  
}






// Endpoint POST pour ajouter un utilisateur avec son rôle
router.post('/add_utilisateur_with_role', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis,CategorieArtisan,CategorieFournisseur, RoleId,Agree } = req.body;

    // Vérifier si l'ID du rôle est fourni dans le corps de la requête
    if (!RoleId) {
      return res.status(400).json({ error: 'ID du rôle manquant dans la requête' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
    const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
    const cleanedKBis = cleanFilePath(KBis);
    // Créer un nouvel utilisateur dans la base de données avec son rôle
    const utilisateur = await Utilisateur.create({
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Password: hashedPassword,
      Telephone,
      AdressePostale,
      Activite,
      CA,
      Effectif,
      References,
      QuestionnaireTarif: cleanedQuestionnaireTarif,
      AssuranceRCDecennale: cleanedAssuranceRCDecennale,
      KBis: cleanedKBis,
      CategorieArtisan:CategorieArtisan,
      CategorieFournisseur,
      RoleId // Associer l'ID du rôle à l'utilisateur
    });

    // Répondre avec l'utilisateur ajouté
    res.status(201).json(utilisateur);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour ajouter un particulier
router.post('/add_particulier', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { RaisonSociale, NumeroSIRET, Nom,NomDirigeant,Qualifications,ZoneGeographiqueDactivite,Adresse, Prenom, Email, Password, Telephone, AdressePostale,CodePostal,CommunePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis,CategorieArtisan,CategorieFournisseur, RoleId,Agree } = req.body;

    // Vérifier si l'ID du rôle est fourni dans le corps de la requête
    if (!RoleId) {
      return res.status(400).json({ error: 'ID du rôle manquant dans la requête' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
    const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
    const cleanedKBis = cleanFilePath(KBis);
    // Créer un nouvel utilisateur dans la base de données avec son rôle
    const utilisateur = await Utilisateur.create({
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Password: hashedPassword,
      Telephone,
      AdressePostale,
      CodePostal,
      CommunePostale,
      Activite,
      CA,
      NomDirigeant,Qualifications,ZoneGeographiqueDactivite,Adresse,
      Effectif,
      References,
      QuestionnaireTarif: cleanedQuestionnaireTarif,
      AssuranceRCDecennale: cleanedAssuranceRCDecennale,
      KBis: cleanedKBis,
      CategorieArtisan,
      CategorieFournisseur,
      RoleId // Associer l'ID du rôle à l'utilisateur
    });


    parametre = await Parametre.findOne({
      where: { Type: 'email_alerte' }
    });
    let email = parametre.ValeurTexte;
    const currentDate = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailDemandePartenariat.ejs');
    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      RaisonSociale,
      AdressePostale,
      Nom,
      Prenom,
      Telephone,
      email_user:Email,
    });

    const mailOptions = {
      from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
      to: email,
      subject: `Vous avez une nouvelle demande de partenariat`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    console.log(`email de ${Email} envoyé à ${email}`)

    // Répondre avec l'utilisateur ajouté
    res.status(201).json(utilisateur);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour ajouter une autorisation
router.post('/add_autorisation', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre,Explications, DateDeCreation } = req.body;

    // Créer une nouvelle autorisation dans la base de données
    const nouvelleAutorisation = await Autorisation.create({
      Titre,
      Explications,
      DateDeCreation // Assurez-vous que la date est au bon format
    });

    // Répondre avec l'autorisation ajoutée
    res.status(201).json(nouvelleAutorisation);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'autorisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter un nouveau rôle avec des autorisations
router.post('/add_role', async (req, res) => {
  try {
    // Récupérer les données du corps de la requête
    const { Titre, Commentaire, Autorisations } = req.body;

    // Créer un nouveau rôle dans la base de données
    const nouveauRole = await Role.create({
      Titre,
      Commentaire
    });

    // Associer les autorisations au nouveau rôle
    if (Autorisations && Autorisations.length > 0) {
      await Promise.all(Autorisations.map(async (autorisation) => {
        try {
          let autorisationExistante;

          // Rechercher l'autorisation par son ID
          if (autorisation.Id) {
            autorisationExistante = await Autorisation.findByPk(autorisation.Id);
          }

          // Si l'autorisation n'existe pas, la créer
          if (!autorisationExistante && autorisation.Explications) {
            autorisationExistante = await Autorisation.create({
              Titre: autorisation.Titre,
              Explications: autorisation.Explications,
              DateDeCreation: new Date() // Date de création actuelle
            });
          }

          // Si l'autorisation n'a pas pu être créée ou trouvée, passer à l'autorisation suivante
          if (!autorisationExistante) {
            throw new Error('Impossible de créer ou de trouver l\'autorisation');
          }

          // Associer l'autorisation au rôle
          await RoleAutorisation.create({
            RoleId: nouveauRole.Id,
            AutorisationId: autorisationExistante.Id
          });
        } catch (error) {
          console.error('Erreur lors de l\'association de l\'autorisation au rôle :', error);
        }
      }));
    }

    // Répondre avec le rôle ajouté
    res.status(201).json(nouveauRole);
  } catch (error) {
    console.error('Erreur lors de la création du rôle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// Endpoint POST pour attribuer un rôle à un utilisateur
router.post('/add_role_to_user', async (req, res) => {
  try {
    // Récupérer les IDs de l'utilisateur et du rôle à partir du corps de la requête
    const { UserId, RoleId } = req.body;

    // Vérifier si l'utilisateur et le rôle existent dans la base de données
    const utilisateur = await Utilisateur.findByPk(UserId);
    const role = await Role.findByPk(RoleId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    // Associer le rôle à l'utilisateur
    await utilisateur.setRole(RoleId);
    // Répondre avec un message de succès
    res.status(200).json({ message: 'Rôle attribué avec succès à l\'utilisateur' });
  } catch (error) {
    console.error('Erreur lors de l\'attribution du rôle à l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Définir le point de terminaison pour ajouter un projet
router.post('/add_project', async (req, res) => {
  try {
    const { Nom, Description,Date_de_debut_des_travaux,Date_de_fin_des_travaux,Date_de_fin_gpa, User_id, Client_id, Artisans,Devis } = req.body;
    
    // Définir la date de création actuelle et le statut par défaut
    const Date_de_creation = new Date();
    const Status = 'visite à régler';
    
    // Créer un nouveau projet
    const newProject = await Projet.create({
      Nom,
      Date_de_creation,
      Date_de_debut_des_travaux,
      Date_de_fin_des_travaux,
      Date_de_fin_gpa,
      Status,
      Description,
      User_id,
      Client_id
    });

 

    if (Devis && Devis.length > 0) {

  await ProjetDevis.destroy({
    where: {
      devis_id: Devis
    }
  });

  await ProjetDevis.bulkCreate(
    Devis.map(devisId => ({
      projet_id: newProject.Id,
      devis_id: devisId
    }))
  );
}

    // Récupérer le projet avec les associations pour la réponse
    const projectWithAssociations = await Projet.findOne({
      where: { Id: newProject.Id },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: DevisPiece, through: { model: ProjetDevis }, as: 'Devis' }
      ]
    });

    res.status(201).json(projectWithAssociations);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'An error occurred while creating the project.' });
  }
});

router.get('/edit_projet_devis/:projet_id/:devis_id/:action', async (req, res) => {
  try {
    const { projet_id, devis_id, action } = req.params;

    if (action === 'add') {

      await ProjetDevis.create({
        projet_id,
        devis_id
      });

    } else if (action === 'delete') {

      await ProjetDevis.destroy({
        where: {
          projet_id,
          devis_id
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Action invalide'
      });
    }

    res.json({
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
