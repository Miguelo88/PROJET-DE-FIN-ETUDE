// server/index.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "billetavionmoinchere",
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});