const express = require('express');
const Role = require('./Role');
const crypto = require('crypto');
const Utilisateur = require('./Utilisateur');
const RoleAutorisation = require('./RoleAutorisation');
const cors = require('cors');
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
const { Op } = require('sequelize');

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
