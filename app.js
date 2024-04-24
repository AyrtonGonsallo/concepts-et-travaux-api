var http = require('http');
const express = require('express');
const getconnectToDatabase = require('./database_connect');
const User = require('./User');
const Grade = require('./Grade'); // Importez le modèle Grade
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
app.get('/get_user/:email', async (req, res) => {
    try {
      const email = req.params.email; // Récupérez l'e-mail de l'URL
  
      // Recherchez l'utilisateur dans la base de données par son e-mail
      const user = await User.findOne({
        where: {
          email: email
        },
        include: Grade // Inclure les grades associés à l'utilisateur
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
app.get('/get_users', async (req, res) => {
    try {
      const email = req.params.email; // Récupérez l'e-mail de l'URL
  
      // Recherchez l'utilisateur dans la base de données par son e-mail
      const users = await User.findAll({
      
        include: Grade // Inclure les grades associés à l'utilisateur
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


  app.post('/add_user', async (req, res) => {
    try {
        // Vérifiez si req.body est défini et non vide
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Le corps de la requête est vide ou malformé' });
        }

        // Extraire les données de la requête
        const { firstName, lastName, email, password, grades } = req.body;

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer un nouvel utilisateur
        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            password: hashedPassword,
            email: email
        });

        // Créer des grades associés à l'utilisateur
        if (grades && grades.length > 0) {
            await Promise.all(grades.map(async (gradeData) => {
                const grade = await Grade.create({
                    value: gradeData.value,
                    day: gradeData.day,
                    checked: gradeData.checked,
                    UserId: user.id
                });
                return grade;
            }));
        }

        res.status(201).json(user); // Renvoie l'utilisateur créé avec succès
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ error: 'Erreur serveur' }); // Renvoie une erreur serveur en cas de problème
    }
});


// Fonction pour authentifier l'utilisateur
async function check_and_get_login_user(email, password) {
    try {
        // Trouver l'utilisateur correspondant à l'email
        const user = await User.findOne({ where: { email: email } });
        
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
        <p>points de terminaison.</p>
        <ul>
            <li>get_users - recuperer tous les utilisateurs</li>
            <li>get_user:email - recuperer un utilisateur par mail</li>
            <li>adduser - ajouter un utilisateur</li>
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
