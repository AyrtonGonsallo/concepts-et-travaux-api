// db.js

const mysql = require('mysql');
require('dotenv').config();
function connectToDatabase() {
  const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
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
