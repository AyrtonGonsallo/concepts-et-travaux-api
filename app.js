var http = require('http');
const getconnectToDatabase = require('./database_connect');
const User = require('./User');
const Grade = require('./Grade'); // Importez le modèle Grade

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
