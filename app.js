const express = require('express');
const Role = require('./Role');
const crypto = require('crypto');
const Utilisateur = require('./Utilisateur');
const RoleAutorisation = require('./RoleAutorisation');
const DevisCalculator = require('./services/DevisCalculator');
const PieceCategorie=require('./PieceCategorie')
const Travail=require('./Travail')
const PieceTravail=require('./PieceTravail')
const Pointcle=require('./Pointcle')
const Avis=require('./Avis')
const Gamme=require('./Gamme')
const ejs = require('ejs');
const TacheGenerale=require('./TacheGenerale')
const DevisPiece=require('./DevisPiece')
const DevisTache=require('./DevisTache')
const Page=require('./Page')
const PointcleRealisation=require('./PointcleRealisation')
const BesoinProjet=require('./Besoin_projet')
const CategoriePiece=require('./Categorie_piece')
const EtapeProjet=require('./Etape_projet')
const Galerie=require('./Galerie')
const Equipement=require('./Equipement')
const ModeleEquipement=require('./ModeleEquipement')
const BesoinProjetRealisation=require('./BesoinProjetRealisation')
const EtapeProjetRealisation=require('./EtapeProjetRealisation')
const QuestionCategorie=require('./QuestionCategorie')
const QuestionFaq=require('./QuestionFaq')
const CategorieQuestionFaq=require('./CategorieQuestionFaq')
const Image=require('./Image')
const Realisation=require('./Realisation')
const Piece=require('./Piece')
const ProjetArtisan = require('./ProjetArtisan');
const cors = require('cors');
const Projet = require('./Projet'); 
const Autorisation = require('./Autorisation'); // Importez le modèle Grade
const app = express();
const port = 3000;
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nombre de "sauts" pour générer le sel
const fs = require('fs');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const { Op,Sequelize } = require('sequelize');

// Définir le chemin du répertoire contenant les fichiers
const filesDirectory = path.join(__dirname, 'files');
// Créer un transporteur SMTP réutilisable pour envoyer des e-mails via https://homeren.fr/
const transporter = nodemailer.createTransport({
  host: 'homeren.fr', // Serveur SMTP de gestion@homeren.fr
  port: 465, // Port SMTP
  secure: true, // Utiliser SSL
  auth: {
    user: 'gestion@homeren.fr', // Votre adresse e-mail
    pass: 'jom@qPh,{Z5B' // Votre mot de passe
  }
});


// Activer CORS

app.use(cors());
app.use(express.json());



// Route pour ouvrir un fichier dans un nouvel onglet
app.get('/open-file/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'files', fileName);

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
app.get('/get_utilisateur_by_email/:email', async (req, res) => {
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
app.get('/get_utilisateurs_by_role/:role_id', async (req, res) => {
  try {
    const r_id = req.params.role_id; // Récupérez l'e-mail de l'URL

    // Recherchez l'utilisateur dans la base de données par son e-mail
    const users = await Utilisateur.findAll({
      where: {
        RoleId: r_id
      },
      include: Role // Inclure les grades associés à l'utilisateur
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
app.get('/get_utilisateur_by_id/:id', async (req, res) => {
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
app.get('/get_all_user_data_by_id/:id', async (req, res) => {
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
app.get('/get_utilisateurs', async (req, res) => {
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


app.post('/login_user',  cors(), async (req, res) => {
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
app.post('/upload', upload.single('file'), (req, res) => {
  // If the file is uploaded successfully, req.file will contain the file details
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Respond with a success message
  res.json({ message: 'File uploaded successfully' });
});





// Endpoint pour envoyer un e-mail
app.post('/send-email', (req, res) => {
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


app.get('/send-liste-devis-email/:deviceID', async (req, res) => {
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
        }
      ]
    });

    let htmlContent;

    // Si des devis sont trouvés
    if (devisPieces.length > 0) {
      // Générer l'email en utilisant un template EJS avec la liste des devis
      const emailTemplatePath = path.join(__dirname, 'mails-templates', 'emailListeDevis.ejs');
      htmlContent = await ejs.renderFile(emailTemplatePath, { devisPieces });
    } else {
      // Générer un email indiquant qu'aucun devis n'a été trouvé
      const emailTemplatePath = path.join(__dirname, 'mails-templates', 'emailAucunDevis.ejs');
      htmlContent = await ejs.renderFile(emailTemplatePath, { deviceID });
    }

    // Configuration de l'email
    const mailOptions = {
      from: 'gestion@homeren.fr',
      to: 'ayrtongonsallo444@gmail.com',
      subject: 'Détails du Device ID',
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



// Endpoint pour envoyer un e-mail
app.get('/test-email', (req, res) => {
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

app.post('/change_user_password', async (req, res) => {
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

app.get('/restore_user_password/:email', async (req, res) => {
  try {
      const email = req.params.email; // Récupérez l'email de l'URL
      const newpass = generateRandomPassword(12); // Génère un mot de passe de 12 caractères

      const user = await Utilisateur.findOne({
        where: {
          email: {
            [Op.like]: `%${email}%`
          }
        }
      });
        // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newpass, saltRounds);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
      // Mettre à jour le mot de passe de l'utilisateur
      await user.update({ Password: hashedPassword });
      // Préparer les données pour l'e-mail
      const mailData = {
        from: 'gestion@homeren.fr',
        to: email,
        subject: 'Confirmation de la réinitialisation du mot de passe',
        text: `Bonjour,

        Vous avez demandé une réinitialisation de votre mot de passe. Votre mot de passe a été mis à jour avec succès(${newpass}).
        Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez contacter notre support immédiatement.

        Cordialement,
        Votre équipe support`
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


// Endpoint POST pour ajouter un utilisateur
app.post('/add_utilisateur', async (req, res) => {
  try {
      // Récupérer les données de la requête
      const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email,Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis } = req.body;
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
          KBis
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
app.post('/add_front_utilisateur', async (req, res) => {
  try {
     // Récupérer les données de la requête
    const {  nom, prenom, email, password, phoneNumber, AdressePostale, CodePostal,CommunePostale,roleId,deviceID,Agree } = req.body;

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


      // Répondre avec l'utilisateur ajouté
      res.status(201).json(utilisateur);
  } catch (error) {
      // En cas d'erreur, répondre avec le code d'erreur 500
      console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

function cleanFilePath(filePath) {
  return filePath.replace(/^.*\\fakepath\\/, '');
}



// Endpoint POST pour ajouter un utilisateur avec son rôle
app.post('/add_utilisateur_with_role', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis, RoleId,Agree } = req.body;

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
app.post('/add_particulier', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale,CodePostal,CommunePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis, RoleId,Agree } = req.body;

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
      Effectif,
      References,
      QuestionnaireTarif: cleanedQuestionnaireTarif,
      AssuranceRCDecennale: cleanedAssuranceRCDecennale,
      KBis: cleanedKBis,
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


// Endpoint POST pour ajouter une autorisation
app.post('/add_autorisation', async (req, res) => {
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
app.post('/add_role', async (req, res) => {
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
app.post('/add_role_to_user', async (req, res) => {
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
app.post('/add_project', async (req, res) => {
  try {
    const { Nom, Description, User_id, Client_id, Artisans } = req.body;
    
    // Définir la date de création actuelle et le statut par défaut
    const Date_de_creation = new Date();
    const Status = 'devis en cours';
    
    // Créer un nouveau projet
    const newProject = await Projet.create({
      Nom,
      Date_de_creation,
      Status,
      Description,
      User_id,
      Client_id
    });

    // Ajouter les artisans au projet
    if (Artisans && Artisans.length > 0) {
      const artisanPromises = Artisans.map(artisanId => 
        ProjetArtisan.create({
          projet_id: newProject.Id,
          artisan_id: artisanId
        })
      );
      await Promise.all(artisanPromises);
    }

    // Récupérer le projet avec les associations pour la réponse
    const projectWithAssociations = await Projet.findOne({
      where: { Id: newProject.Id },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Utilisateur, through: { model: ProjetArtisan }, as: 'Artisans' }
      ]
    });

    res.status(201).json(projectWithAssociations);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'An error occurred while creating the project.' });
  }
});


// Définir le point de terminaison pour modifier un projet
app.put('/update_project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, Description, Artisans } = req.body;

    const project = await Projet.findByPk(id);

    if (project) {
      project.Status = Status;
      project.Description = Description;

      await project.save();

      // Mettre à jour les artisans associés au projet
      if (Artisans && Artisans.length > 0) {
        // Supprimer les artisans actuels
        await ProjetArtisan.destroy({ where: { projet_id: project.Id } });
        // Ajouter les nouveaux artisans
        const artisanPromises = Artisans.map(artisanId => 
          ProjetArtisan.create({
            projet_id: project.Id,
          artisan_id: artisanId
          })
        );
        await Promise.all(artisanPromises);
      }

      // Récupérer le projet avec les associations pour la réponse
      const updatedProject = await Projet.findOne({
        where: { Id: project.Id },
        include: [
          { model: Utilisateur, as: 'Utilisateur' },
          { model: Utilisateur, as: 'Client' },
          { model: Utilisateur, through: { model: ProjetArtisan }, as: 'Artisans' }
        ]
      });

      res.status(200).json(updatedProject);
    } else {
      res.status(404).json({ error: 'Project not found.' });
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating the project.' });
  }
});
// Définir le point de terminaison pour supprimer un projet
app.delete('/delete_project/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Projet.destroy({ where: { Id: id } });

    if (result) {
      res.status(200).json({ message: 'Project deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Project not found.' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'An error occurred while deleting the project.' });
  }
});


app.get('/get_project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Projet.findOne({
      where: { Id: id },
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Utilisateur, as: 'Artisans' }
      ]
    });

    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ error: 'Project not found.' });
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'An error occurred while fetching the project.' });
  }
});


// Définissez la route pour récupérer les rôles avec leurs autorisations associées
app.get('/get_projects', async (req, res) => {
  try {
    // Récupérez tous les Projets avec leurs autorisations associées
    const projets = await Projet.findAll({
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Utilisateur, as: 'Artisans' }
      ]
    });

    // Répondez avec les rôles récupérés au format JSON
    res.json(projets);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Définir le point de terminaison pour récupérer la liste des projets
app.get('/get_all_projects', async (req, res) => {
  try {
    const projects = await Projet.findAll({
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Utilisateur, as: 'Artisans' }
      ]
    });    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching the projects.' });
  }
});

// Définir le point de terminaison pour récupérer la liste des projets d'un utilisateur
app.get('/get_user_projects/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Projet.findAll({ 
      include: [
        { model: Utilisateur, as: 'Utilisateur' },
        { model: Utilisateur, as: 'Client' },
        { model: Utilisateur, as: 'Artisans' }
      ],
      where: {  [Sequelize.Op.or]: [
        { User_id: userId },
        { Client_id: userId },
        Sequelize.literal(`EXISTS (SELECT 1 FROM ProjetArtisan WHERE ProjetArtisan.projet_id = Projet.Id AND ProjetArtisan.artisan_id = ${userId})`)
      ] } });

    if (projects.length > 0) {
      res.status(200).json(projects);
    } else {
      res.status(404).json({ error: 'No projects found for the user.' });
    }
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching user projects.' });
  }
});


// Endpoint POST pour modifier un particulier
app.post('/update_particulier/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur à mettre à jour
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale,CodePostal,CommunePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis, RoleId } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
// Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
const cleanedKBis = cleanFilePath(KBis);
console.log(cleanedQuestionnaireTarif)
    // Définir un objet pour stocker les données à mettre à jour
    // Définir un objet pour stocker les données à mettre à jour
    const updateData = {
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Telephone,
      AdressePostale,
      CodePostal,
      CommunePostale,
      Activite,
      CA,
      Effectif,
      References,
      RoleId // Mettez à jour le rôle de l'utilisateur
    };

    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    if (QuestionnaireTarif) {
      const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
      updateData.QuestionnaireTarif = cleanedQuestionnaireTarif;
    }

    if (AssuranceRCDecennale) {
      const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
      updateData.AssuranceRCDecennale = cleanedAssuranceRCDecennale;
    }

    if (KBis) {
      const cleanedKBis = cleanFilePath(KBis);
      updateData.KBis = cleanedKBis;
    }

    // Hasher le mot de passe si un nouveau mot de passe est fourni
    if (Password!="000") {
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      updateData.Password = hashedPassword;
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update(updateData);

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour modifier un utilisateur et ses rôles
app.post('/update_utilisateur/:id', async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur à mettre à jour
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis, RoleId } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
// Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
const cleanedKBis = cleanFilePath(KBis);
console.log(cleanedQuestionnaireTarif)
    // Définir un objet pour stocker les données à mettre à jour
    // Définir un objet pour stocker les données à mettre à jour
    const updateData = {
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Telephone,
      AdressePostale,
      Activite,
      CA,
      Effectif,
      References,
      RoleId // Mettez à jour le rôle de l'utilisateur
    };

    // Utilisez la fonction cleanFilePath pour nettoyer les chemins d'accès des fichiers
    if (QuestionnaireTarif) {
      const cleanedQuestionnaireTarif = cleanFilePath(QuestionnaireTarif);
      updateData.QuestionnaireTarif = cleanedQuestionnaireTarif;
    }

    if (AssuranceRCDecennale) {
      const cleanedAssuranceRCDecennale = cleanFilePath(AssuranceRCDecennale);
      updateData.AssuranceRCDecennale = cleanedAssuranceRCDecennale;
    }

    if (KBis) {
      const cleanedKBis = cleanFilePath(KBis);
      updateData.KBis = cleanedKBis;
    }

    // Hasher le mot de passe si un nouveau mot de passe est fourni
    if (Password!="000") {
      const hashedPassword = await bcrypt.hash(Password, saltRounds);
      updateData.Password = hashedPassword;
    }

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update(updateData);

    // Répondre avec l'utilisateur mis à jour
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/clear_questionnaire_tarif/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ QuestionnaireTarif à vide
    utilisateur.QuestionnaireTarif = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'QuestionnaireTarif mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/clear_assurance_rc_decennale/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ AssuranceRCDecennale à vide
    utilisateur.AssuranceRCDecennale = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'AssuranceRCDecennale mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/clear_kbis/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe dans la base de données
    const utilisateur = await Utilisateur.findByPk(userId);

    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le champ KBis à vide
    utilisateur.KBis = '';

    // Sauvegarder les modifications
    await utilisateur.save();

    res.status(200).json({ message: 'KBis mis à vide avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





// Définissez la route pour récupérer les rôles avec leurs autorisations associées
app.get('/get_roles', async (req, res) => {
  try {
    // Récupérez tous les rôles avec leurs autorisations associées
    const roles = await Role.findAll({
      include: {
        model: Autorisation,
        through: {
          attributes: [] // Excluez les attributs de la table de liaison RoleAutorisation
        }
      }
    });

    // Répondez avec les rôles récupérés au format JSON
    res.json(roles);
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint GET pour récupérer un rôle par son ID avec ses autorisations associées
app.get('/get_role/:id', async (req, res) => {
  try {
    // Récupérer l'ID du rôle spécifié dans les paramètres d'URL
    const roleId = req.params.id;

    // Récupérer le rôle spécifique par son ID avec ses autorisations associées
    const role = await Role.findByPk(roleId, {
      include: {
        model: Autorisation,
        through: {
          attributes: [] // Exclure les attributs de la table de liaison RoleAutorisation
        }
      }
    });

    // Vérifier si le rôle existe
    if (!role) {
      return res.status(404).json({ error: 'Rôle non trouvé' });
    }

    // Répondre avec le rôle récupéré au format JSON
    res.json(role);
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint GET pour récupérer toutes les autorisations
app.get('/get_autorisations', async (req, res) => {
  try {
      // Récupérer toutes les autorisations
      const autorisations = await Autorisation.findAll();

      res.status(200).json(autorisations);
  } catch (error) {
      console.error('Erreur lors de la récupération des autorisations :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint GET pour récupérer un ensemble d'autorisations par ID
app.get('/get_autorisations/:ids', async (req, res) => {
  try {
    const ids = req.params.ids.split(','); // Séparer les IDs par une virgule s'ils sont fournis sous forme de liste
    
    // Récupérer les autorisations par ID
    const autorisations = await Autorisation.findAll({
      where: {
        Id: ids
      }
    });

    res.status(200).json(autorisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des autorisations :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint GET pour récupérer un ensemble d'autorisations par ID
app.get('/get_utilisateurs/:ids', async (req, res) => {
  try {
    const ids = req.params.ids.split(','); // Séparer les IDs par une virgule s'ils sont fournis sous forme de liste
    
    // Récupérer les autorisations par ID
    const utilisateurs = await Utilisateurs.findAll({
      where: {
        Id: ids
      }
    });

    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint GET pour récupérer une autorisation par son ID
app.get('/get_autorisation/:id', async (req, res) => {
  try {
      // Récupérer l'ID de l'autorisation à partir des paramètres de la requête
      const autorisationId = req.params.id;

      // Recherche de l'autorisation par son ID
      const autorisation = await Autorisation.findByPk(autorisationId);

      // Vérifier si l'autorisation existe
      if (!autorisation) {
          return res.status(404).json({ error: 'Autorisation non trouvée' });
      }

      // Retourner l'autorisation trouvée
      res.status(200).json(autorisation);
  } catch (error) {
      console.error('Erreur lors de la récupération de l\'autorisation :', error);
      res.status(500).json({ error: 'Erreur serveur' });
  }
});






// Endpoint DELETE pour supprimer une autorisation par son ID
app.delete('/delete_autorisation/:id', async (req, res) => {
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
app.delete('/delete_role/:id', async (req, res) => {
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
app.delete('/delete_utilisateur/:id', async (req, res) => {
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
app.put('/update_role/:id', async (req, res) => {
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
app.put('/update_autorisation/:id', async (req, res) => {
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
app.post('/ajouter_besoin_projet', async (req, res) => {
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
app.post('/ajouter_categorie_piece', async (req, res) => {
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
app.post('/ajouter_etape_projet', async (req, res) => {
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
// Endpoint DELETE pour supprimer une réalisation sans les relations (besoins et étapes)
app.delete('/delete_realisation/:realisationId', async (req, res) => {
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
app.post('/add_realisation', async (req, res) => {
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
app.put('/update_realisation/:realisationId', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');


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


// Endpoint POST pour ajouter une réalisation avec ses besoins et étapes
app.post('/ajouter_realisation', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
  const transaction = await sequelize.transaction();

  try {
    // Récupérer les données de la requête
    const { Titre,SousTitre, Superficie, Prix, Image_principale, Description, Duree, Top, GalerieID, PieceID, Besoins, Etapes,Pointcles } = req.body;

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      SousTitre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top,
      GalerieID,
      PieceID
    }, { transaction });

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      // Ajouter les besoins associés à la réalisation
      await Promise.all(Besoins.map(async (besoinID) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoinID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Etapes.map(async (etapeID) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etapeID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Pointcles && Pointcles.length > 0) {
      // Ajouter les étapes associées à la réalisation
      await Promise.all(Pointcles.map(async (pointcleID) => {
        await PointcleRealisation.create({
          PointcleID: pointcleID,
          RealisationID: nouvelleRealisation.ID
        }, { transaction });
      }));
    }

    await transaction.commit();

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    await transaction.rollback();
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour ajouter une réalisation avec ses besoins, étapes et galerie avec images
app.post('/add_realisation_with_gallery', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Superficie, Prix, Image_principale, Description, Duree, Top, Besoins, Etapes, Galery } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre: Galery.Titre // Ajouter d'autres propriétés de la galerie si nécessaire
    });

    // Vérifier si des images sont fournies dans la requête
    if (Galery && Galery.Images && Galery.Images.length > 0) {
      // Créer les images associées à la galerie
      const nouvellesImages = await Promise.all(Galery.Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url, // Ajouter d'autres propriétés de l'image si nécessaire
          GalerieID:nouvelleGalerie.ID
        });
      }));

      
    }

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top
    });

    // Associer la galerie à la réalisation
    await nouvelleRealisation.setGalerie(nouvelleGalerie);

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

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/ajouter_realisation', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Superficie, Prix, Image_principale, Description, Duree, Top, Besoins, Etapes, Galery, PieceID } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre: Galery.Titre
    });

    // Vérifier si des images sont fournies dans la requête
    if (Galery && Galery.Images && Galery.Images.length > 0) {
      await Promise.all(Galery.Images.map(async (image) => {
        await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: nouvelleGalerie.ID
        });
      }));
    }

    // Créer une nouvelle réalisation dans la base de données
    const nouvelleRealisation = await Realisation.create({
      Titre,
      Superficie,
      Prix,
      Image_principale,
      Description,
      Duree,
      Top,
      GalerieID: nouvelleGalerie.ID,
      PieceID: PieceID // Associer la réalisation à la pièce
    });

    // Vérifier si des besoins sont fournis dans la requête
    if (Besoins && Besoins.length > 0) {
      await Promise.all(Besoins.map(async (besoin) => {
        await BesoinProjetRealisation.create({
          BesoinProjetID: besoin.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Vérifier si des étapes sont fournies dans la requête
    if (Etapes && Etapes.length > 0) {
      await Promise.all(Etapes.map(async (etape) => {
        await EtapeProjetRealisation.create({
          EtapeProjetID: etape.ID,
          RealisationID: nouvelleRealisation.ID
        });
      }));
    }

    // Répondre avec la réalisation ajoutée
    res.status(201).json(nouvelleRealisation);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réalisation :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour ajouter une galerie
app.post('/add_galerie', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre
    });

    // Répondre avec la galerie ajoutée
    res.status(201).json(nouvelleGalerie);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la galerie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter une image et la lier à une galerie
app.post('/add_image', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Url, GalerieID } = req.body;

    // Créer une nouvelle image dans la base de données
    const nouvelleImage = await Image.create({
      Titre,
      Url,
      GalerieID // Spécifier l'ID de la galerie à laquelle l'image appartient
    });

    // Répondre avec l'image ajoutée
    res.status(201).json(nouvelleImage);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de l\'image :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint POST pour ajouter une galerie avec des images
app.post('/add_galerie_with_images', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { Titre, Images } = req.body;

    // Créer une nouvelle galerie dans la base de données
    const nouvelleGalerie = await Galerie.create({
      Titre
    });

    // Vérifier si des images sont fournies dans la requête
    if (Images && Images.length > 0) {
      // Créer les images associées à la galerie
      const nouvellesImages = await Promise.all(Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: nouvelleGalerie.ID // Associer l'image à la galerie créée
        });
      }));

      // Associer les nouvelles images à la galerie
      nouvelleGalerie.Images = nouvellesImages;
    }

    // Répondre avec la galerie ajoutée et ses images
    res.status(201).json(nouvelleGalerie);
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout de la galerie avec images :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint POST pour ajouter des images à une galerie existante
app.post('/add_images_to_galerie/:galerieId', async (req, res) => {
  try {
    const galerieId = req.params.galerieId; // Récupérer l'ID de la galerie à partir des paramètres de la route
    const { Titre, Images } = req.body;

    // Vérifier si la galerie existe
    const galerie = await Galerie.findByPk(galerieId);
    if (!galerie) {
      return res.status(404).json({ error: 'Galerie non trouvée' });
    }

    // Mettre à jour le titre de la galerie si un nouveau titre est fourni
    if (Titre) {
      galerie.Titre = Titre;
      await galerie.save();
    }

    let nouvellesImages = [];
    if (Images) {
      // Ajouter chaque image à la galerie
      nouvellesImages = await Promise.all(Images.map(async (image) => {
        return await Image.create({
          Titre: image.Titre,
          Url: image.Url,
          GalerieID: galerie.ID // Associer l'image à la galerie existante
        });
      }));
    }

    // Répondre avec les nouvelles images ajoutées
    res.status(201).json({ galerie, nouvellesImages });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de l\'ajout des images à la galerie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint DELETE pour supprimer une image d'une galerie
app.delete('/delete_image_from_gallery/:image_id', async (req, res) => {
  try {
    const imageId = req.params.image_id; // Récupérer l'ID de l'image à partir des paramètres de la route

    // Trouver l'image par ID
    const image = await Image.findByPk(imageId);

    // Vérifier si l'image existe
    if (!image) {
      return res.status(404).json({ error: 'Image non trouvée' });
    }

    // Supprimer l'image de la base de données
    await image.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la suppression de l\'image :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint DELETE pour supprimer une pièce
app.delete('/delete_piece/:pieceId', async (req, res) => {
  try {
    const pieceId = req.params.pieceId; // Récupérer l'ID de la pièce à partir des paramètres de la route

    // Vérifier si la pièce existe
    const piece = await Piece.findByPk(pieceId);

    if (!piece) {
      return res.status(404).json({ error: 'Pièce non trouvée' });
    }

    // Supprimer la pièce
    await piece.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Pièce supprimée avec succès' });
  } catch (error) {
    // En cas d'erreur, répondre avec le code d'erreur 500
    console.error('Erreur lors de la suppression de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}); 

app.post('/add_piece', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

  const transaction = await sequelize.transaction();
  try {
    const { Image_principale,Image_presentation, Titre, Presentation, Description, Categories, Gallery } = req.body;

    // Créer une nouvelle pièce dans la base de données
    const nouvellePiece = await Piece.create({
      Image_principale,
      Image_presentation,
      Titre,
      Présentation:Presentation,
      Description
    }, { transaction });

    // Ajouter les catégories associées à la pièce
    if (Categories && Categories.length > 0) {
      await Promise.all(Categories.map(async (categorieID) => {
        await PieceCategorie.create({
          PieceID: nouvellePiece.ID,
          CategoriePieceID: categorieID
        }, { transaction });
      }));
    }

    // Vérifier si une galerie est fournie dans la requête
    if (Gallery) {
      const { Titre: GalerieTitre, Images } = Gallery;

      // Créer une nouvelle galerie dans la base de données
      const nouvelleGalerie = await Galerie.create({
        Titre: GalerieTitre
      }, { transaction });

      // Associer la galerie à la pièce
      nouvellePiece.GalerieID = nouvelleGalerie.ID;
      await nouvellePiece.save({ transaction });

      // Ajouter les images associées à la galerie
      if (Images && Images.length > 0) {
        await Promise.all(Images.map(async (image) => {
          await Image.create({
           
            Titre: image.Titre,
            Url: image.Url,
            GalerieID: nouvelleGalerie.ID
          }, { transaction });
        }));
      }
    }

    await transaction.commit();

    res.status(201).json(nouvellePiece);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/ajouter_piece', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

  const transaction = await sequelize.transaction();
  try {
    const { Image_principale,Image_presentation, Titre, Presentation, Description, Categories, GalerieID } = req.body;

    // Créer une nouvelle pièce dans la base de données
    const nouvellePiece = await Piece.create({
      Image_principale,
      Image_presentation,
      Titre,
      Présentation: Presentation,
      Description,
      GalerieID // Associer directement l'ID de la galerie fourni
    }, { transaction });

    // Ajouter les catégories associées à la pièce
    if (Categories && Categories.length > 0) {
      await Promise.all(Categories.map(async (categorieID) => {
        await PieceCategorie.create({
          PieceID: nouvellePiece.ID,
          CategoriePieceID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();

    res.status(201).json({
      ID: nouvellePiece.ID,
      GalerieID: nouvellePiece.GalerieID // Retourne l'ID de la galerie associée
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de l\'ajout de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint PUT pour mettre à jour une pièce
app.put('/update_piece/:pieceId', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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

app.get('/get_realisations', async (req, res) => {
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


app.get('/get_realisations_by_piece/:p_id', async (req, res) => { // Ajout de ":" avant "p_id"
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



app.get('/get_nbr_realisations/:count', async (req, res) => {
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
app.get('/get_realisation/:id', async (req, res) => {
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
app.get('/get_pieces', async (req, res) => {
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
      ]
    });
    res.status(200).json(pieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/get_pieces_par_categories', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');



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


app.get('/get_nbr_pieces/:count', async (req, res) => {
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
      limit: count // Limiter le nombre de résultats
    });

    res.status(200).json(pieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Endpoint pour récupérer une pièce spécifique avec ses catégories et sa galerie
app.get('/get_piece/:id', async (req, res) => {
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

// Endpoint pour récupérer une galerie avec ses images
app.get('/get_galerie/:id', async (req, res) => {
  const galerieId = req.params.id;
  try {
    // Récupérer la galerie avec son ID
    const galerie = await Galerie.findByPk(galerieId);
    if (!galerie) {
      return res.status(404).json({ message: `Galerie avec l'ID ${galerieId} non trouvée` });
    }

    // Récupérer toutes les images associées à la galerie
    const images = await Image.findAll({ where: { GalerieID: galerieId } });

    // Ajouter les images à la réponse de la galerie
    galerie.dataValues.images = images;

    // Répondre avec la galerie et ses images
    res.status(200).json(galerie);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la galerie avec l'ID ${galerieId} :`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// Définir le point de terminaison pour supprimer un projet
app.delete('/delete_galerie/:id', async (req, res) => {
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
// Endpoint pour récupérer toutes les galeries avec leurs images
app.get('/get_galeries', async (req, res) => {
  try {
    // Récupérer toutes les galeries
    const galeries = await Galerie.findAll();

    // Parcourir chaque galerie pour récupérer ses images
    const galeriesWithImages = await Promise.all(galeries.map(async (galerie) => {
      // Récupérer les images associées à chaque galerie
      const images = await Image.findAll({ where: { GalerieID: galerie.ID } });
      // Ajouter les images à la galerie
      galerie.dataValues.images = images;
      return galerie;
    }));

    // Répondre avec toutes les galeries et leurs images
    res.status(200).json(galeriesWithImages);
  } catch (error) {
    console.error('Erreur lors de la récupération des galeries :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.get('/get_etapes_projet', async (req, res) => {
  try {
    const etapesProjet = await EtapeProjet.findAll();
    res.status(200).json(etapesProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une étape de projet par son ID
app.get('/get_etape_projet/:id', async (req, res) => {
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
app.put('/update_etape_projet/:id', async (req, res) => {
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
app.delete('/delete_etape_projet/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await EtapeProjet.destroy({ where: { Id: id } });
    res.status(200).json({ message: 'Étape de projet supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étape de projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/get_besoins_projet', async (req, res) => {
  try {
    const besoinsProjet = await BesoinProjet.findAll();
    res.status(200).json(besoinsProjet);
  } catch (error) {
    console.error('Erreur lors de la récupération des besoins du projet :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer un besoin de projet par son ID
app.get('/get_besoin_projet/:id', async (req, res) => {
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
app.put('/update_besoin_projet/:id', async (req, res) => {
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
app.delete('/delete_besoin_projet/:id', async (req, res) => {
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

app.get('/get_categories_piece', async (req, res) => {
  try {
    const categories_piece = await CategoriePiece.findAll();
    res.status(200).json(categories_piece);
  } catch (error) {
    console.error('Erreur lors de la récupération des categories de pieces :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de pièce par son ID
app.get('/get_categorie_piece/:id', async (req, res) => {
  try {
    const categoriePiece = await CategoriePiece.findByPk(req.params.id);
    if (!categoriePiece) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json(categoriePiece);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour une catégorie de pièce
app.put('/update_categorie_piece/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const categoriePiece = await CategoriePiece.findByPk(req.params.id);
    if (!categoriePiece) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }

    categoriePiece.Titre = Titre || categoriePiece.Titre;
    categoriePiece.Description = Description || categoriePiece.Description;
    await categoriePiece.save();

    res.status(200).json(categoriePiece);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une catégorie de pièce par son ID
app.delete('/delete_categorie_piece/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategoriePiece.destroy({
      where: { ID: req.params.id }
    });
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Catégorie de pièce non trouvée' });
    }
    res.status(200).json({ message: 'Catégorie de pièce supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie de pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.post('/create_categorie_question', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const nouvelleCategorie = await CategorieQuestionFaq.create({ Titre, Description });
    res.status(201).json(nouvelleCategorie);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.post('/add_question', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
  const { Titre, Question, Reponse, CategorieQuestionFaqs } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Créer la nouvelle question dans la base de données
    const nouvelleQuestion = await QuestionFaq.create({
      Titre,
      Question,
      Reponse
    }, { transaction });

    // Ajouter les catégories associées à la question
    if (CategorieQuestionFaqs && CategorieQuestionFaqs.length > 0) {
      await Promise.all(CategorieQuestionFaqs.map(async (categorieID) => {
        await QuestionCategorie.create({
          QuestionID: nouvelleQuestion.ID,
          CategorieID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();
    res.status(201).json(nouvelleQuestion);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la création de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/get_questions', async (req, res) => {
  try {
    const questions = await QuestionFaq.findAll({
      include: [{
        model: CategorieQuestionFaq,
        through: {
          attributes: []
        }
      }]
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/get_questions_par_categorie/:id', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

  const categorieId = req.params.id;

  try {
    // Récupérer les questions associées à la catégorie spécifiée
    const questions = await sequelize.query(
      `SELECT q.* FROM QuestionFaq q,Question_Categorie qc,CategorieQuestionFaq c
       WHERE q.ID=qc.QuestionID and c.ID=qc.CategorieID and
       c.ID = :categorieId`,
      {
        replacements: { categorieId },
        type: Sequelize.QueryTypes.SELECT,
        model: QuestionFaq,
        mapToModel: true,
        
      }
    );

    res.status(200).json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions par catégorie :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/get_questions_par_categories', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');



  try {
    const query = `
      SELECT q.ID, q.Titre, q.Question, q.Reponse, c.ID as cat_id, c.Titre as categorie
      FROM QuestionFaq q
      INNER JOIN Question_Categorie qc ON q.ID = qc.QuestionID
      INNER JOIN CategorieQuestionFaq c ON c.ID = qc.CategorieID
      ORDER BY c.ID, q.ID`;

    const questions = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    let result = [];
    let currentCategorie = 0;
    let categorieObject = null;

    questions.forEach(row => {
      if (row.cat_id != currentCategorie) {
        // Nouvelle catégorie
        if (categorieObject !== null) {
          result.push(categorieObject);
        }
        currentCategorie = row.cat_id;
        categorieObject = {
          CategorieID: row.cat_id,
          Titre: row.categorie,
          Questions: []
        };
      }
      // Ajouter la question à la catégorie actuelle
      categorieObject.Questions.push({
        QuestionID: row.ID,
        Titre: row.Titre,
        Question: row.Question,
        Reponse: row.Reponse
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

app.get('/get_categories_question', async (req, res) => {
  try {
    const categories = await CategorieQuestionFaq.findAll();

    res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de questions :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une question par son ID
app.get('/get_question/:id', async (req, res) => {
  try {
    const question = await QuestionFaq.findByPk(req.params.id, {
      include: [{
        model: CategorieQuestionFaq,
        through: {
          attributes: []
        }
      }]
    });

    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Erreur lors de la récupération de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour récupérer une catégorie de question par son ID
app.get('/get_categorie_question/:id', async (req, res) => {
  try {
    const categorie = await CategorieQuestionFaq.findByPk(req.params.id);

    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    res.status(200).json(categorie);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une question par son ID
app.delete('/delete_question/:id', async (req, res) => {
  try {
    const rowsDeleted = await QuestionFaq.destroy({
      where: {
        ID: req.params.id
      }
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    res.status(200).json({ message: 'Question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer une catégorie de question par son ID
app.delete('/delete_categorie_question/:id', async (req, res) => {
  try {
    const rowsDeleted = await CategorieQuestionFaq.destroy({
      where: {
        ID: req.params.id
      }
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    res.status(200).json({ message: 'Catégorie de question supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour une question
app.put('/update_question/:id', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');
  const { Titre, Question, Reponse, CategorieQuestionFaqs } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Trouver la question à mettre à jour
    const question = await QuestionFaq.findByPk(req.params.id, { transaction });
    if (!question) {
      return res.status(404).json({ error: 'Question non trouvée' });
    }

    // Mettre à jour les champs de la question
    question.Titre = Titre;
    question.Question = Question;
    question.Reponse = Reponse;

    await question.save({ transaction });

    // Mettre à jour les catégories associées à la question
    if (CategorieQuestionFaqs && CategorieQuestionFaqs.length > 0) {
      // Supprimer les anciennes associations
      await QuestionCategorie.destroy({
        where: { QuestionID: question.ID },
        transaction
      });

      // Ajouter les nouvelles associations
      await Promise.all(CategorieQuestionFaqs.map(async (categorieID) => {
        await QuestionCategorie.create({
          QuestionID: question.ID,
          CategorieID: categorieID
        }, { transaction });
      }));
    }

    await transaction.commit();
    res.status(200).json(question);
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la mise à jour de la question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
  
});

// Endpoint pour mettre à jour une catégorie de question
app.put('/update_categorie_question/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;

    // Trouver la catégorie à mettre à jour
    const categorie = await CategorieQuestionFaq.findByPk(req.params.id);
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie de question non trouvée' });
    }

    // Mettre à jour les champs de la catégorie
    categorie.Titre = Titre;
    categorie.Description = Description;

    await categorie.save();
    res.status(200).json(categorie);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie de question :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour créer un Pointcle
app.post('/add_pointcle', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const nouveauPointcle = await Pointcle.create({ Titre, Description });
    res.status(201).json(nouveauPointcle);
  } catch (error) {
    console.error('Erreur lors de la création du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour obtenir tous les Pointcles
app.get('/get_pointscle', async (req, res) => {
  try {
    const pointscles = await Pointcle.findAll();
    res.status(200).json(pointscles);
  } catch (error) {
    console.error('Erreur lors de la récupération des Pointcles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour obtenir un Pointcle par ID
app.get('/get_pointcle/:id', async (req, res) => {
  try {
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    res.status(200).json(pointcle);
  } catch (error) {
    console.error('Erreur lors de la récupération du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour mettre à jour un Pointcle par ID
app.put('/update_pointcle/:id', async (req, res) => {
  try {
    const { Titre, Description } = req.body;
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    pointcle.Titre = Titre;
    pointcle.Description = Description;
    await pointcle.save();
    res.status(200).json(pointcle);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Endpoint pour supprimer un Pointcle par ID
app.delete('/delete_pointcle/:id', async (req, res) => {
  try {
    const pointcle = await Pointcle.findByPk(req.params.id);
    if (!pointcle) {
      return res.status(404).json({ error: 'Pointcle non trouvé' });
    }
    await pointcle.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du Pointcle :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create
app.post('/add_avis', async (req, res) => {
  try {
      const avis = await Avis.create(req.body);
      res.status(201).json(avis);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Read all
app.get('/get_all_avis', async (req, res) => {
  try {
      const avis = await Avis.findAll();
      res.status(200).json(avis);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Read one
app.get('/get_avis/:id', async (req, res) => {
  try {
      const avis = await Avis.findByPk(req.params.id);
      if (avis) {
          res.status(200).json(avis);
      } else {
          res.status(404).json({ error: 'Avis not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/update_avis/:id', async (req, res) => {
  try {
      const [updated] = await Avis.update(req.body, {
          where: { ID: req.params.id }
      });
      if (updated) {
          const updatedAvis = await Avis.findByPk(req.params.id);
          res.status(200).json(updatedAvis);
      } else {
          res.status(404).json({ error: 'Avis not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete('/delete_avis/:id', async (req, res) => {
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
app.post('/add_page', async (req, res) => {
  try {
    const newPage = await Page.create(req.body);
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire toutes les pages
app.get('/get_pages', async (req, res) => {
  try {
    const pages = await Page.findAll();
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire une seule page par ID
app.get('/get_page/:id', async (req, res) => {
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
app.get('/get_page_by_title/:titre', async (req, res) => {
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
app.put('/update_page/:id', async (req, res) => {
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
app.delete('/delete_page/:id', async (req, res) => {
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
app.post('/add_equipement/', async (req, res) => {
  try {
    const newEquipement = await Equipement.create(req.body);
    res.status(201).json(newEquipement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all
app.get('/get_equipements/', async (req, res) => {
  try {
    const equipements = await Equipement.findAll({
      include: [
        { model: Piece }
      ]
    });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read one
app.get('/get_equipement/:id', async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id,{
      include: [
        {
          model: Piece, // Inclure les informations de la pièce associée à l'équipement
        },
        {
          model: ModeleEquipement, // Inclure tous les modèles d'équipement associés à l'équipement
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
app.get('/get_equipements_by_piece/:pid', async (req, res) => {
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
        },
      ],
    });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Endpoint pour récupérer les Equipements par PieceID
app.get('/get_equipements_by_type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const equipements = await Equipement.findAll({
      where: { Type: type },
      include: [
        {
          model: Piece, // Inclure les informations de la pièce associée à l'équipement
        },
        {
          model: ModeleEquipement, // Inclure tous les modèles d'équipement associés à l'équipement
        },
      ],
    });
    res.status(200).json(equipements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Update
app.put('/update_equipement/:id', async (req, res) => {
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
app.delete('/delete_equipement/:id', async (req, res) => {
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

app.post('/add_travail', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
app.get('/get_travaux_by_piece/:pid', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

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
app.get('/get_validated_travaux_by_piece/:pid', async (req, res) => {
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

  const pieceId = req.params.pid;

  try {
    // Récupérer les questions associées à la catégorie spécifiée
    const questions = await sequelize.query(
      `SELECT t.* FROM Travail t,PieceTravail pt,Piece p
       WHERE t.ID=pt.TravailID and p.ID=pt.PieceID and
       p.ID = :pieceId and t.Valide=1`,
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
app.get('/get_travaux', async (req, res) => {
  try {
    const travaux = await Travail.findAll({
      include: {
        model: Piece,
        through: {
          model: PieceTravail,
          attributes: [] // Si vous ne voulez pas inclure les attributs de la table de jointure PieceTravail
        }
      }
    });

    res.status(200).json(travaux);
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux avec les détails de la pièce :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// GET travail par ID avec les détails de la pièce associée
app.get('/get_travail/:id', async (req, res) => {
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
app.put('/update_travail/:id', async (req, res) => {
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
app.delete('/delete_travail/:id', async (req, res) => {
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
app.post('/add_modele_equipement', async (req, res) => {
  try {
    const { Titre, Description, Image, Prix,Longeur, Largeur, Hauteur, Epaisseur, Matiere, EquipementID } = req.body;

    // Création du modèle d'équipement dans la base de données
    const newModeleEquipement = await ModeleEquipement.create({
      Titre,
      Description,
      Image,
      Prix,
      Longeur,
      Largeur,
      Hauteur,
      Epaisseur,
      Matiere,
      EquipementID
    });

    res.status(201).json(newModeleEquipement);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du modèle d\'équipement :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET one by ID
app.get('/get_modele_equipement/:id', async (req, res) => {
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
app.put('/update_modele_equipement/:id', async (req, res) => {
  try {
    const modele = await ModeleEquipement.findByPk(req.params.id);
    if (modele) {
      // Mise à jour des champs requis
      modele.Titre = req.body.Titre;
      modele.Description = req.body.Description;
      modele.Prix = req.body.Prix;
      modele.Longeur = req.body.Longeur;
      modele.Largeur = req.body.Largeur;
      modele.Hauteur = req.body.Hauteur;
      modele.Epaisseur = req.body.Epaisseur;
      modele.Matiere = req.body.Matiere;
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

// Delete
app.delete('/delete_modele_equipement/:id', async (req, res) => {
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
app.get('/get_modeles_equipement', async (req, res) => {
  try {
    const modeles = await ModeleEquipement.findAll();
    res.status(200).json(modeles);
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.post('/test_calcul_auto_devis_prix', (req, res) => {
  try {
    const calculator = new DevisCalculator();
      const travaux = req.body;
      let total=0
      setTimeout(() => {
        for(i=0;i<travaux.length;i++){
          let travail=travaux[i]
          let prix = calculator.calculer_prix(travail.idtache,travail);
          console.log("prix: ",prix)
          total+=prix
        }
        res.status(200).json({ prix: total });
    }, 3000);
      
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/add_devis_piece', async (req, res) => {
  const { username, ip, piece, liste_des_travaux,deviceID } = req.body;
  const sequelize = new Sequelize('mysql://mala3315_concepts_et_travaux_user:h-c4J%25-%7DP%2C12@109.234.166.164:3306/mala3315_concepts_et_travaux');

  const t = await sequelize.transaction();
  
  try {
    const calculator = new DevisCalculator();
    await calculator.initTaches();
    
    let total = 0;
    
    for (let i = 0; i < liste_des_travaux.length; i++) {
        let travail = liste_des_travaux[i];
        let prix = await calculator.calculer_prix(travail.idtache, travail);
        total += prix;
    }
    
    console.log("Prix: ", total);


    // Créer le DevisPiece
    const devisPiece = await DevisPiece.create({
      Username: username,
      AdresseIP: ip,
      Date: new Date(),
      Commentaire: null,
      PieceID: piece.ID,
      Prix: total,
      Payed: 0,
      UtilisateurID: null,
      DeviceID:deviceID
    }, { transaction: t });

    // Créer les DevisTache
    const devisTaches = liste_des_travaux.map(tache => {
      let prix = calculator.calculer_prix_tache(tache);
      return {
        TravailID: tache.idtache,
        DevisPieceID: devisPiece.ID,
        TravailSlug: tache.nomtache,
        Commentaires: null,
        Prix:prix,
        Donnees: tache.formulaire
      };
    });

    await DevisTache.bulkCreate(devisTaches, { transaction: t });

    await t.commit();

    res.status(201).json({ message: 'Devis créé avec succès',devis:devisPiece });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la création du devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/get_devis_piece/:id', async (req, res) => {
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

    res.status(200).json(devisPiece);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



app.post('/get_devis_piece_by_username_and_ip', async (req, res) => {
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


app.get('/get_no_payed_devis_piece_by_device_id/:device_id', async (req, res) => {
  const { device_id } = req.params;
  try {
    const devisPieces = await DevisPiece.findAll({
      where: {
        Payed: 0,
        DeviceID:device_id
        
      },include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        }
      ]
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


app.post('/get_no_payed_devis_piece', async (req, res) => {
  const { username, ip } = req.body;
console.log({ username, ip })
  try {
    const devisPieces = await DevisPiece.findAll({
      where: {
        Payed: 0,
        Username: username,
        AdresseIP: ip
      },include: [
        {
          model: DevisTache,
          include: [Travail]
        },
        {
          model: Piece
        }
      ]
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


app.get('/get_all_devis_piece', async (req, res) => {
  try {
    const devisPieces = await DevisPiece.findAll({
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

    if (!devisPieces || devisPieces.length === 0) {
      return res.status(404).json({ error: 'Aucun devis trouvé' });
    }

    res.status(200).json(devisPieces);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.delete('/delete_devis_piece/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDevisPiece = await DevisPiece.findByPk(id);

    if (!deletedDevisPiece) {
      return res.status(404).json({ error: 'Devis pièce non trouvé' });
    }

    await deletedDevisPiece.destroy();
    res.status(204).end(); // 204 No Content: succès de la suppression
  } catch (error) {
    console.error('Erreur lors de la suppression du devis pièce :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du devis pièce' });
  }
});
app.put('/update_devis_piece/:id', async (req, res)  => {
  const { id } = req.params;
  const updatedDevis = req.body;

  try {
    const devis = await DevisPiece.findByPk(id);

    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    // Mettre à jour les champs nécessaires
    devis.Utilisateur = updatedDevis.Utilisateur;
    devis.AdresseIP = updatedDevis.AdresseIP;
    devis.Date = updatedDevis.Date;
    devis.Commentaire = updatedDevis.Commentaire;
    devis.Prix = updatedDevis.Prix;
    devis.Payed = updatedDevis.Payed;
    devis.UtilisateurID = updatedDevis.UtilisateurID;

    // Sauvegarder les modifications
    await devis.save();

    return res.status(200).json(devis);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/valider_devis_piece/:id', async (req, res)  => {
  const { id } = req.params;
  try {
    const devis = await DevisPiece.findByPk(id);
    if (!devis) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }
    // Mettre à jour les champs nécessaire
    devis.Payed = 1;
    // Sauvegarder les modifications
    await devis.save();

    return res.status(200).json(devis);
  } catch (error) {
    console.error('Erreur lors de la validation du devis :', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.post('/add_gamme', async (req, res) => {
  try {
      const gamme = await Gamme.create(req.body);
      res.status(201).json(gamme);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.get('/get_gammes', async (req, res) => {
  try {
    const gammes = await Gamme.findAll();
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/get_gamme/:id', async (req, res) => {
  try {
    const gamme = await Gamme.findByPk(req.params.id);
    if (gamme) {
      res.status(200).json(gamme);
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/update_gamme/:id', async (req, res) => {
  try {
    const [updated] = await Gamme.update(req.body, {
      where: { ID: req.params.id }
    });
    if (updated) {
      const updatedGamme = await Gamme.findByPk(req.params.id);
      res.status(200).json(updatedGamme);
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/delete_gamme/:id', async (req, res) => {
  try {
    const deleted = await Gamme.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'Gamme not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint to fetch gammes by travailID and type
app.get('/get_gammes_by_type_and_travailID/:tid/:type', async (req, res) => {
  const { tid, type } = req.params;
  
  try {
    const gammes = await Gamme.findAll({
      where: {
        TravailID: tid,
        Type: type
      }
    });
    res.status(200).json(gammes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/add_tache_generale', async (req, res) => {
  try {
      const tache_generale = await TacheGenerale.create(req.body);
      res.status(201).json(tache_generale);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.get('/get_tache_generales', async (req, res) => {
  try {
    const tache_generales = await TacheGenerale.findAll();
    res.status(200).json(tache_generales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/get_tache_generale/:id', async (req, res) => {
  try {
    const tache_generale = await TacheGenerale.findByPk(req.params.id);
    if (tache_generale) {
      res.status(200).json(tache_generale);
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/update_tache_generale/:id', async (req, res) => {
  try {
    const [updated] = await TacheGenerale.update(req.body, {
      where: { ID: req.params.id }
    });
    if (updated) {
      const updatedTacheGenerale = await TacheGenerale.findByPk(req.params.id);
      res.status(200).json(updatedTacheGenerale);
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/delete_tache_generale/:id', async (req, res) => {
  try {
    const deleted = await TacheGenerale.destroy({
      where: { ID: req.params.id }
    });
    if (deleted) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: 'TacheGenerale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



















  // Point de terminaison pour la racine de l'application
app.get('/', (req, res) => {
    // Définissez le contenu HTML que vous souhaitez afficher
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Api concept et travaux</title>
      </head>
      <body>
        <h1>Bienvenue sur l'api concept et travaux !</h1>
        <h3>points de terminaison:</h3>
        Voici la liste des méthodes avec leur nom, type et description au format HTML :
<ul>
  <li>
    <strong>Nom :</strong> <code>/api-concepts-et-travaux/open-file/:fileName</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Ouvre un fichier dans un nouvel onglet en utilisant son nom de fichier fourni en paramètre.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_utilisateur_by_email/:email</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère un utilisateur par son e-mail.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_utilisateur_by_id/:id</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère un utilisateur par son ID.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_all_user_data_by_id/:id</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère un utilisateur avec son rôle et ses autorisations par son ID.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_utilisateurs</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère tous les utilisateurs.
  </li>
  <li>
    <strong>Nom :</strong> <code>/login_user</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Authentifie un utilisateur avec son e-mail et mot de passe.
  </li>
  <li>
    <strong>Nom :</strong> <code>/upload</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Gère le téléchargement de fichiers.
  </li>
  <li>
    <strong>Nom :</strong> <code>/send-email</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Envoie un e-mail avec les informations fournies.
  </li>
  <li>
    <strong>Nom :</strong> <code>/test-email</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Envoie un e-mail de test.
  </li>
  <li>
    <strong>Nom :</strong> <code>/change_user_password</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Change le mot de passe d'un utilisateur.
  </li>
  <li>
    <strong>Nom :</strong> <code>/restore_user_password/:email</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Réinitialise le mot de passe d'un utilisateur et envoie un e-mail de confirmation.
  </li>
  <li>
    <strong>Nom :</strong> <code>/add_utilisateur</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Ajoute un nouvel utilisateur.
  </li>
  <li>
    <strong>Nom :</strong> <code>/add_utilisateur_with_role</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Ajoute un nouvel utilisateur avec son rôle.
  </li>
  <li>
    <strong>Nom :</strong> <code>/add_autorisation</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Ajoute une nouvelle autorisation.
  </li>
  <li>
    <strong>Nom :</strong> <code>/add_role</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Ajoute un nouveau rôle avec des autorisations.
  </li>
  <li>
    <strong>Nom :</strong> <code>/add_role_to_user</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Attribue un rôle à un utilisateur.
  </li>
  <li>
    <strong>Nom :</strong> <code>/update_utilisateur/:id</code> <br>
    <strong>Type :</strong> POST <br>
    <strong>Description :</strong> Modifie un utilisateur et ses rôles.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_roles</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère les rôles avec leurs autorisations associées.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_role/:id</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère un rôle par son ID avec ses autorisations associées.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_autorisations</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère toutes les autorisations.
  </li>
  <li>
    <strong>Nom :</strong> <code>/get_autorisations/:ids</code> <br>
    <strong>Type :</strong> GET <br>
    <strong>Description :</strong> Récupère un ensemble d'autorisations par ID.
  </li>
</ul>


      </body>
      </html>
    `;
  
    // Envoyez la réponse avec le contenu HTML
    res.send(htmlContent);
  });

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
