var http = require('http');
const express = require('express');
const getconnectToDatabase = require('./database_connect');
const Role = require('./Role');
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

const plaintextPassword = 'MotDePasse123'; // Le mot de passe en clair que vous souhaitez hasher


/*

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'It works!\n',
        version = 'NodeJS ' + process.versions.node + '\n',
        connect = 'connection a la base de données: ' + getconnectToDatabase() + '\n',
        response = [message, version,connect].join('\n');
    res.end(response);
});
server.listen(3000, async () => {
    console.log('Serveur démarré sur le port 3000');
  // Exemple de création d'un utilisateur
  try {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      Grades: [
        { value: 'A', day: new Date(), checked: true },
        { value: 'B', day: new Date(), checked: false},
        { value: 'C', day: new Date(), checked: true }
      ]
    }, {
      include: Grade
    });

    console.log('Utilisateur créé avec succès:', user.toJSON());
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
  }
    
  
    // Vous pouvez utiliser dbConnection pour exécuter des requêtes SQL ou effectuer d'autres opérations sur la base de données.
  });
*/


app.use(express.json())
// Activer CORS
app.use(cors());

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
        const user = await Utilisateur.findOne({ where: { email: email }  });
        
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


app.post('/login_user', async (req, res) => {
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


// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files/'); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    //console.log(file)
    cb(null, file.originalname); // Rename the file with a timestamp and original extension
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
      await user.update({ password: hashedPassword });

      res.status(200).json({ message: 'Mot de passe mis à jour avec succès' }); // Renvoie un message de succès
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
      QuestionnaireTarif: cleanedQuestionnaireTarif,
      AssuranceRCDecennale: cleanedAssuranceRCDecennale,
      KBis: cleanedKBis,
      RoleId // Mettez à jour le rôle de l'utilisateur
    };

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
        <ul>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_utilisateur_by_email/:email
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère un utilisateur par son e-mail.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_utilisateur_by_id/:id
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère un utilisateur par son ID.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_utilisateurs
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère tous les utilisateurs.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/login_user
    <ul>
      <li>Type : POST</li>
      <li>Description : Authentifie un utilisateur.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/change_user_password
    <ul>
      <li>Type : POST</li>
      <li>Description : Change le mot de passe d'un utilisateur.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/add_utilisateur
    <ul>
      <li>Type : POST</li>
      <li>Description : Ajoute un utilisateur.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/add_utilisateur_with_role
    <ul>
      <li>Type : POST</li>
      <li>Description : Ajoute un utilisateur avec un rôle.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/add_autorisation
    <ul>
      <li>Type : POST</li>
      <li>Description : Ajoute une autorisation.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/add_role
    <ul>
      <li>Type : POST</li>
      <li>Description : Ajoute un rôle avec des autorisations.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/add_role_to_user
    <ul>
      <li>Type : POST</li>
      <li>Description : Attribue un rôle à un utilisateur.</li>
    </ul>
  </li>
  <li>
    <strong>POST</strong> /api-concepts-et-travaux/update_utilisateur/:id
    <ul>
      <li>Type : POST</li>
      <li>Description : Met à jour un utilisateur.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_roles
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère tous les rôles avec leurs autorisations associées.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_role/:id
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère un rôle par son ID avec ses autorisations associées.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_autorisations
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère toutes les autorisations.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_autorisations/:ids
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère un ensemble d'autorisations par ID.</li>
    </ul>
  </li>
  <li>
    <strong>GET</strong> /api-concepts-et-travaux/get_autorisation/:id
    <ul>
      <li>Type : GET</li>
      <li>Description : Récupère une autorisation par son ID.</li>
    </ul>
  </li>
  <li>
    <strong>DELETE</strong> /api-concepts-et-travaux/delete_autorisation/:id
    <ul>
      <li>Type : DELETE</li>
      <li>Description : Supprime une autorisation par son ID.</li>
    </ul>
  </li>
  <li>
    <strong>PUT</strong> /api-concepts-et-travaux/update_utilisateur/:id
    <ul>
      <li>Type : PUT</li>
      <li>Description : Met à jour un utilisateur par son ID.</li>
    </ul>
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
