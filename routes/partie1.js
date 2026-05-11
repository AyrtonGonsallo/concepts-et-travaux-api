const express = require('express');
const router = express.Router();
const Role = require('../Role');
const Utilisateur = require('../Utilisateur');
const Travail=require('../Travail')
const Tva=require('../Tva')
const ejs = require('ejs');
const DevisPiece=require('../DevisPiece')
const DevisTache=require('../DevisTache')

const Visite=require('../Visite')

const Piece=require('../Piece')
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



// Route pour ouvrir un fichier dans un nouvel onglet
router.get('/open-file/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '..', 'files', fileName);
  
    // Lire le contenu du fichier
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Erreur lors de la lecture du fichier');
        return;
      }
  
   
  
      // Obtenir le type MIME à partir de l'extension de fichier
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
  
    // Envoyer le fichier en réponse avec le bon type MIME
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': 'attachment' // Forcer le téléchargement
    }).sendFile(filePath);
  });
  });
  
  
  
  // Point de terminaison GET pour récupérer un utilisateur par son e-mail
  router.get('/get_utilisateur_by_email/:email', async (req, res) => {
      try {
        const email = req.params.email; // Récupérez l'e-mail de l'URL
    
        // Recherchez l'utilisateur dans la base de données par son e-mail
        const user = await Utilisateur.findOne({
          where: {
            email: email
          },
          include: Role // Inclure les grades associés à l'utilisateur
        });
    
        if (user) {
          res.json(user); // Renvoie l'utilisateur au format JSON
        } else {
          res.status(404).json({ error: 'Utilisateur non trouvé' }); // Renvoie une erreur si l'utilisateur n'est pas trouvé
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
      }
    });
  
  
    
  // Point de terminaison GET pour récupérer un utilisateur par son e-mail
  router.get('/get_utilisateurs_by_role/:role_id', async (req, res) => {
    try {
      const r_id = req.params.role_id; // Récupérez l'e-mail de l'URL
  
      // Recherchez l'utilisateur dans la base de données par son e-mail
      const users = await Utilisateur.findAll({
        where: {
          RoleId: r_id
        },
        include: Role, // Inclure les grades associés à l'utilisateur
        order: [['Nom', 'ASC']] 
      });
  
      if (users) {
        res.json(users); // Renvoie l'utilisateur au format JSON
      } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' }); // Renvoie une erreur si l'utilisateur n'est pas trouvé
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
    }
  });
  
    
  // Point de terminaison GET pour récupérer un utilisateur par son id
  router.get('/get_utilisateur_by_id/:id', async (req, res) => {
    try {
      const id = req.params.id; // Récupérez l'id de l'URL
  
      // Recherchez l'utilisateur dans la base de données par son e-mail
      const user = await Utilisateur.findByPk(id);
  
      if (user) {
        user.password="000"
        res.json(user); // Renvoie l'utilisateur au format JSON
      } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' }); // Renvoie une erreur si l'utilisateur n'est pas trouvé
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
    }
  });
  
    
  // Point de terminaison GET pour récupérer un utilisateur avec son role et ses autorisations par son id
  router.get('/get_all_user_data_by_id/:id', async (req, res) => {
    try {
      const id = req.params.id; // Récupérez l'id de l'URL
  
      // Recherchez l'utilisateur dans la base de données par son e-mail
      const user = await Utilisateur.findByPk(id, {
        include: [
          {
            model: Role,
            include: [
              {
                model: Autorisation,
                through: {
                  attributes: [] // Si vous ne voulez pas inclure les attributs de liaison
                }
              }
            ]
          }
        ]
      });
  
      if (user) {
        user.password = "000";
        res.json(user); // Renvoie l'utilisateur au format JSON
      } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' }); // Renvoie une erreur si l'utilisateur n'est pas trouvé
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
    }
  });
  
  
  // Point de terminaison GET pour récupérer tous les utilisateurs 
  router.get('/get_utilisateurs', async (req, res) => {
      try {
        const email = req.params.email; // Récupérez l'e-mail de l'URL
    
        // Recherchez l'utilisateur dans la base de données par son e-mail
        const users = await Utilisateur.findAll({
        
          include: Role // Inclure les grades associés à l'utilisateur
        });
    
        if (users) {
          res.json(users); // Renvoie l'utilisateur au format JSON
        } else {
          res.status(404).json({ error: 'Utilisateurs non trouvés' }); // Renvoie une erreur si l'utilisateur n'est pas trouvé
        }
      } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
      }
    });
  
  
   
  
  
  // Fonction pour authentifier l'utilisateur
  async function check_and_get_login_user(email, password) {
      try {
          // Trouver l'utilisateur correspondant à l'email
          const user = await Utilisateur.findOne({
            where: {
              email: {
                [Op.like]: `%${email}%`
              }
            }
          });
          
          // Vérifier si l'utilisateur existe
          if (!user) {
              throw new Error('Utilisateur non trouvé');
          }
          //console.log(password, user.Password)
          // Vérifier si le mot de passe correspond au hachage stocké
          const passwordMatch = await bcrypt.compare(password, user.Password);
  
          if (!passwordMatch) {
              throw new Error('Mot de passe incorrect');
          }
  
          // Si tout est correct, renvoyer l'utilisateur
          return user;
      } catch (error) {
          throw error; // Renvoyer toute erreur rencontrée lors de l'authentification
      }
  }
  
  
  router.post('/login_user',  cors(), async (req, res) => {
      try {
        
          // Extraire l'email et le mot de passe de la requête
          const { email, password } = req.body;
  
          // Vérifier si l'email et le mot de passe ont été fournis
          if (!email || !password) {
              return res.status(400).json({ error: 'Veuillez fournir l\'email et le mot de passe' });
          }
  
          // Authentifier l'utilisateur en utilisant la fonction login_user
          const user = await check_and_get_login_user(email, password);
          
          // Si l'authentification est réussie, renvoyer l'utilisateur
          res.status(200).json(user);
          
      } catch (error) {
          // Si une erreur se produit pendant l'authentification, renvoyer un message d'erreur
          console.error('Erreur lors de la connexion de l\'utilisateur :', error.message);
          res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
  });
  function slugify(text) {
    return text
    .toLowerCase() // Convertir le texte en minuscules
    .replace(/[^\w\s.-]/g, '') // Supprimer les caractères non alphanumériques sauf les espaces, les tirets et les points
    .replace(/[\s_-]+/g, '-') // Remplacer les espaces et les tirets par un seul tiret
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin de chaîne
  }
  
  // Set up multer storage configuration
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'files/'); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      //console.log(file)
      const originalName = file.originalname;
      const encodedName = slugify(originalName); // Encoder le nom du fichier
  
      cb(null, encodedName); // Renommer le fichier avec le nom encodé 
    }
  });
  
  // Initialize multer with the storage configuration
  const upload = multer({ storage: storage });
  
  // Endpoint to handle file upload
  router.post('/upload', upload.single('file'), (req, res) => {
    // If the file is uploaded successfully, req.file will contain the file details
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Respond with a success message
    res.json({ message: 'File uploaded successfully' });
  });
  
  
  
  
  
  // Endpoint pour envoyer un e-mail
  router.post('/send-email', (req, res) => {
    // Récupérer les informations de l'e-mail à partir de la requête
    const { to, subject, text } = req.body;
  
    // Définir les options de l'e-mail
    const mailOptions = {
      from: 'gestion@homeren.fr',
      to: to,
      subject: subject,
      text: text
    };
  
    // Envoyer l'e-mail
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail' });
      } else {
        console.log('E-mail envoyé: ' + info.response);
        res.status(200).json({ message: 'E-mail envoyé' });
      }
    });
  });
  
  
  router.get('/send-liste-devis-email/:deviceID', async (req, res) => {
    const { deviceID } = req.params;
  
    try {
      // Récupérer les devis non payés associés au DeviceID
      const devisPieces = await DevisPiece.findAll({
        where: {
          Payed: 0,
          DeviceID: deviceID
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
          }
        ]
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
      
      const email_user=devisPieces[0].Utilisateur.Email
      const formattedDate = currentDate.toLocaleString('fr-FR', options);
      const dateString = formattedDate.replace(",", " à"); 
      // Si des devis sont trouvés
      if (devisPieces.length > 0) {
        // Générer l'email en utilisant un template EJS avec la liste des devis
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailListeDevis.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, { devisPieces,dateString,email_user  });
      } else {
        // Générer un email indiquant qu'aucun devis n'a été trouvé
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailAucunDevis.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, { deviceID,dateString,email_user });
      }
  
      // Configuration de l'email
      const mailOptions = {
        from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
        to: email_user,
        subject: 'Nous avons reçu votre paiement !',
        html: htmlContent
      };
  
      // Envoyer l'email
      await transporter.sendMail(mailOptions);
      res.send(`Email envoyé pour le deviceID: ${deviceID}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      res.status(500).send('Erreur lors de l\'envoi de l\'email');
    }
  });

  
  
  router.get('/send_payed_devis_liste_to_user/:user_id/:device_id/:total', async (req, res) => {
    const { user_id,device_id,total } = req.params;
  
    try {
      const user = await Utilisateur.findByPk(user_id);
      const projet = await Projet.findOne({
      where: {
          Payed: 0,
          VisiteFaite: 1,
          [Op.or]: [
            { DeviceID: device_id },
            { Client_id: user_id }
          ]
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
      // Récupérer les devis non payés associés au userID
      const devisPieces = projet.Devis
  
      if (!devisPieces) {
        throw new Error(`Aucun devis trouvé avec l'UID: ${user_id}`);
      }

      await Projet.update(
        { Payed: 1 },
        {
          where: {
            Payed: 0,
            VisiteFaite: 1,
            [Op.or]: [
              { DeviceID: device_id },
              { Client_id: user_id }
            ]
          }
        }
      );
      
      let deviceID=devisPieces[0].DeviceID
      let user_email=user.Email
      let pseudo=user.Nom+" "+user.Prenom
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
      let email_user=user_email;
      // Si des devis sont trouvés
      if (devisPieces.length > 0) {
        // Générer l'email en utilisant un template EJS avec la liste des devis
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailPaiementAcompte.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, { pseudo,dateString,email_user,total  });
      } else {
        // Générer un email indiquant qu'aucun devis n'a été trouvé
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailAucunDevis.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, { deviceID,dateString,email_user,total });
      }
  
      // Configuration de l'email
      const mailOptions = {
        from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
        to: user_email,
        subject: 'Nous avons reçu votre acompte !',
        html: htmlContent
      };
  
      // Envoyer l'email
      await transporter.sendMail(mailOptions);
      res.json({ message: `Email envoyé pour l'utilisateur: ${user_email}` });
      console.log(`Email envoyé pour l'utilisateur: ${user_email}`)
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      res.json({ message: `Erreur lors de l\'envoi de l\'email à l'utilisateur : ${user_email}` });
      res.status(500).send('Erreur lors de l\'envoi de l\'email');
    }
  });

  
  
  router.get('/send_visited_devis_liste_to_user/:user_id/:device_id/:projet_id', async (req, res) => {
    const { user_id, device_id,projet_id } = req.params;
  
    try {
      const user = await Utilisateur.findByPk(user_id);
      if (!user) throw new Error("Utilisateur non trouvé");
      const project = await Projet.findOne({
      where: {
        Id: projet_id,
        [Op.or]: [
          { DeviceID: device_id },
          { Client_id: user_id }
        ]
        
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
    await project.update({ Status: 'visite réglée' });
      const devisPieces = project.Devis
  
     
  
      const email_user = user.Email;
      const pseudo = `${user.Nom} ${user.Prenom}`;
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(",", " à");
  
      let htmlContent;
      if (devisPieces.length > 0) {
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailPaiementVisite.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, {
          pseudo,
          dateString: formattedDate,
          email_user,
          user
        });
      } else {
        const emailTemplatePath = path.join(__dirname, '..', 'mails-templates', 'emailAucunDevis.ejs');
        htmlContent = await ejs.renderFile(emailTemplatePath, {
          deviceID: device_id,
          dateString: formattedDate,
          email_user,
          user
        });
      }
  
      
  
      await transporter.sendMail({
        from: `${process.env.MAILS_TITLE} <${process.env.MAILS_USER}>`,
        to: email_user,
        subject: 'Nous avons reçu votre paiement pour la visite du technicien',
        html: htmlContent
      });
  
      res.status(200).json({ message: `Email envoyé pour l'utilisateur: ${email_user}` });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      res.status(500).json({ message: `Erreur lors de l'envoi de l'email`, error: error.message });
    }
  });
  
  
  
 
  

module.exports = router;
