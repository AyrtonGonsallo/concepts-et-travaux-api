const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Import du fichier index.js des routes
const stripeWebhookService = require('./services/stripe.service');
const app = express();

const port = 3000;


app.post('/api-concepts-et-travaux/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
   try {
      await stripeWebhookService.handleStripeWebhook(req);
      res.json({ received: true });
    } catch (error) {
      res.status(400).send(error.message);
    }
});


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', routes); // Montage des routes



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
    <strong>Nom :</strong> <code>/open-file/:fileName</code> <br>
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
