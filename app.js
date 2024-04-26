var http = require('http');
const express = require('express');
const getconnectToDatabase = require('./database_connect');
const Role = require('./Role');
const Utilisateur = require('./Utilisateur');
const RoleAutorisation = require('./RoleAutorisation');
const Autorisation = require('./Autorisation'); // Importez le modèle Grade
const app = express();
const port = 3000;

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


// Point de terminaison GET pour récupérer un utilisateur par son e-mail
app.get('/get_utilisateur/:email', async (req, res) => {
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
        const user = await Utilisateur.findOne({ where: { email: email } });
        
        // Vérifier si l'utilisateur existe
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Vérifier si le mot de passe correspond au hachage stocké
        const passwordMatch = await bcrypt.compare(password, user.password);

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


// Endpoint POST pour ajouter un utilisateur avec son rôle
app.post('/add_utilisateur_with_role', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { RaisonSociale, NumeroSIRET, Nom, Prenom, Email, Password, Telephone, AdressePostale, Activite, CA, Effectif, References, QuestionnaireTarif, AssuranceRCDecennale, KBis, RoleId } = req.body;

    // Vérifier si l'ID du rôle est fourni dans le corps de la requête
    if (!RoleId) {
      return res.status(400).json({ error: 'ID du rôle manquant dans la requête' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

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
      QuestionnaireTarif,
      AssuranceRCDecennale,
      KBis,
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

    // Mettre à jour les informations de l'utilisateur
    await utilisateur.update({
      RaisonSociale,
      NumeroSIRET,
      Nom,
      Prenom,
      Email,
      Password,
      Telephone,
      AdressePostale,
      Activite,
      CA,
      Effectif,
      References,
      QuestionnaireTarif,
      AssuranceRCDecennale,
      KBis,
      RoleId // Mettez à jour le rôle de l'utilisateur
    });

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
  const { Titre, Commentaire } = req.body;

  try {
    // Recherchez le rôle dans la base de données par son ID
    const role = await Role.findByPk(roleId);

    // Vérifiez si le rôle existe
    if (!role) {
      return res.status(404).json({ message: 'Rôle non trouvé' });
    }

    // Mettez à jour les données du rôle
    await role.update({ Titre, Commentaire });

    // Répondez avec le rôle mis à jour
    res.json({ message: 'Rôle mis à jour avec succès', role });
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
          <li><strong>GET /get_utilisateur/:email</strong>: Récupère un utilisateur par son adresse e-mail.</li>
          <li><strong>GET /get_utilisateurs</strong>: Récupère tous les utilisateurs.</li>
          <li><strong>POST /login_user</strong>: Authentifie un utilisateur avec son adresse e-mail et son mot de passe.</li>
          <li><strong>POST /change_user_password</strong>: Change le mot de passe d'un utilisateur.</li>
          <li><strong>POST /add_utilisateur</strong>: Ajoute un nouvel utilisateur.</li>
          <li><strong>POST /add_autorisation</strong>: Ajoute une nouvelle autorisation.</li>
          <li><strong>POST /add_role</strong>: Ajoute un nouveau rôle avec des autorisations.</li>
          <li><strong>POST /add_role_to_user</strong>: Donne un rôle à un utilisateur à partir de leurs identifiants respectifs.</li>
          <li><strong>GET /get_roles</strong>: Récupère tous les rôles avec leurs autorisations associées.</li>
          <li><strong>GET /get_autorisations</strong>: Récupère toutes les autorisations.</li>
          <li><strong>DELETE /delete_autorisation/:id</strong>: Supprime une autorisation par son ID.</li>
          <li><strong>DELETE /delete_role/:id</strong>: Supprime un rôle par son ID.</li>
          <li><strong>DELETE /delete_utilisateur/:id</strong>: Supprime un utilisateur par son ID.</li>
          <li><strong>PUT /update_role/:id</strong>: Met à jour un rôle par son ID.</li>
          <li><strong>PUT /update_autorisation/:id</strong>: Met à jour une autorisation par son ID.</li>
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
