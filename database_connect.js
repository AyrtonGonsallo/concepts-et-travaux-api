// db.js

const mysql = require('mysql');

function connectToDatabase() {
  const connection = mysql.createConnection({
    host     : '109.234.166.164',
    user     : 'mala3315_concepts_et_travaux_user',
    password : 'h-c4J%-}P,12',
    database : 'mala3315_concepts_et_travaux'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données : ' + err.stack);
      return 'Erreur de connexion à la base de données : ' + err.stack;
    }

    console.log('Connecté à la base de données MySQL');
    return 'Connecté à la base de données MySQL';
  });
  return 'tentative de connection...';
  
}

function getconnectToDatabase() {
    
    return connectToDatabase();
  }

module.exports = getconnectToDatabase;
