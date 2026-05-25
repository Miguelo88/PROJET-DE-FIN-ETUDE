const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Pour générer le JWT perso
const connectDB = require("../config/connexionBD");

// 🔐 Clé secrète pour signer ton JWT (à mettre dans un .env ensuite)
const JWT_SECRET = "votre_clé_secrète_longue_ici_ou_process.env.JWT_SECRET";

/**
 * Inscription normale avec email/mot de passe
 */
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // ❌ Vérifie que tous les champs sont présents
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // 🗄️ Récupère la connexion à la base
    const db = await connectDB();

    // 🔍 Recherche si l'email existe déjà
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);

    // ⚠️ Si un utilisateur avec cet email existe déjà
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // 🔏 Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insertion de l'utilisateur dans la base
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // ✅ Envoi d'une réponse de succès avec l'ID inséré
    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Connexion / inscription via Google (Google OAuth)
 * req.body doit contenir :
 *   - token: jeton ID Google
 *   - email: email de l'utilisateur Google
 *   - name: nom de l'utilisateur
 */
async function googleLogin(req, res) {
  try {
    const { token, email, name } = req.body;

    // ❌ Vérifie que le jeton et les infos essentielles sont présents
    if (!token || !email || !name) {
      return res.status(400).json({ message: "Jeton et infos utilisateur requis" });
    }

    // 🗄️ Récupère la connexion à la base
    const db = await connectDB();

    // 🔍 1. Vérifie si cet email existe déjà dans ta table users
    const [existingUsers] = await db.execute("SELECT id, name, email, password FROM users WHERE email = ?", [email]);

    let user;
    let isCreated = false;

    // ✅ Si l'utilisateur existe déjà
    if (existingUsers.length > 0) {
      user = existingUsers[0];
      console.log(`Utilisateur Google déjà existant : ${email}`);
    }
    // ✅ Sinon, on le crée automatiquement (avec password NULL / pas de mot de passe)
    else {
      const [result] = await db.execute(
        "INSERT INTO users (name, email, provider) VALUES (?, ?, 'google')",
        [name, email]
      );

      // Récupère le nouvel utilisateur pour éviter de faire une nouvelle requête
      const [newUser] = await db.execute("SELECT id, name, email FROM users WHERE id = ?", [result.insertId]);
      user = newUser[0];
      isCreated = true;
      console.log(`Nouvel utilisateur Google créé : ${email}`);
    }

    // 📦 2. Prépare les données à mettre dans le JWT
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      // provider: user.provider || "local", // "local" = inscription classique
    };

    // 🔐 3. Génère un JWT personnalisé (valable 24h par exemple)
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    // ✅ Envoie le JWT et des infos utilisateur au frontend
    return res.status(200).json({
      message: isCreated
        ? "Utilisateur Google créé et connecté avec succès"
        : "Utilisateur Google connecté avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // provider: user.provider,
      },
      token: jwtToken, // 👈 Ton JWT à stocker dans localStorage / cookie
    });
  } catch (error) {
    console.error("Erreur dans googleLogin :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion Google" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs" });
    }

    const db = await connectDB();
      // j'ai supprime provider car il n'est pas dans ma table users et ca me generait une erreur, si tu veux le remettre pense a l'ajouter dans ta table users
    const [users] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];

    if (!user.password) {
      return res.status(400).json({
        message: "Ce compte a été créé avec un fournisseur externe",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      // provider: user.provider || "local",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // provider: user.provider || "local",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// 🔽 On exporte les deux fonctions
module.exports = { registerUser, googleLogin,loginUser };