const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion MySQL:', err);
    return;
  }
  console.log('✅ Connecté à MySQL !');
});

module.exports = db;