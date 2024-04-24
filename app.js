var http = require('http');
const getconnectToDatabase = require('./database_connect');
var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'It works!\n',
        version = 'NodeJS ' + process.versions.node + '\n',
        connect = 'connection a la base de données: ' + getconnectToDatabase() + '\n',
        response = [message, version,connect].join('\n');
    res.end(response);
});
server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
  
    
  
    // Vous pouvez utiliser dbConnection pour exécuter des requêtes SQL ou effectuer d'autres opérations sur la base de données.
  });
