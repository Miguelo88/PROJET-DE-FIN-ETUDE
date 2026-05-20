// // server/index.js
// const express = require("express");
// const cors = require("cors");
// const mysql = require("mysql2/promise");
// const bcrypt = require("bcryptjs");

// const app = express();

// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// let db;

// // Route d'inscription
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Champs requis manquants" });
//     }

//     const [existingUsers] = await db.execute(
//       "SELECT id FROM users WHERE email = ?",
//       [email]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(409).json({ message: "Cet email est déjà utilisé" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const [result] = await db.execute(
//       "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
//       [name, email, hashedPassword]
//     );

//     return res.status(201).json({
//       message: "Utilisateur créé avec succès",
//       userId: result.insertId,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// // Fonction pour connecter la BDD puis lancer le serveur web
// async function startServer() {
//   try {
//     db = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       password: "",
//       database: "billetavionmoinchere",
//     });
//     console.log("Connecté à la base de données MySQL avec succès !");

//     app.listen(3000, () => {
//       console.log("Server running on http://localhost:3000");
//     });
//   } catch (err) {
//     console.error("Impossible de démarrer le serveur :", err);
//   }
// }

// startServer();


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
