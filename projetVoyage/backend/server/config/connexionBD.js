
const mysql = require("mysql2/promise");

let db;

async function connectDB() {
  if (!db) {
    db = await mysql.createConnection({
      host: "127.0.0.1", // Sécurisé pour éviter les bugs IPv6 sous Windows
      user: "root",
      password: "",
      database: "billetavionmoinchere",
    });
    console.log("Connecté à la base de données MySQL avec succès !");
  }
  return db;
}

// On exporte la fonction de connexion
module.exports = connectDB;
