const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/connexionBD");

// 🔐 Clé secrète pour signer ton JWT
const JWT_SECRET = process.env.JWT_SECRET;

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

    const db = await connectDB();

    // 🔍 Recherche si l'email existe déjà
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    // 🔏 Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insertion de l'utilisateur (role par défaut = 'user')
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword],
    );

    // ✅ Génère un JWT avec le rôle
    const payload = {
      id: result.insertId,
      email: email,
      name: name,
      role: "user", // 👈 Rôle par défaut
    };

    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: result.insertId,
      token: jwtToken,
      user: {
        id: result.insertId,
        name: name,
        email: email,
        role: "user", // 👈 Rôle renvoyé
        isAdmin: false, // ajouter
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
// // j'essai ce nouveau code . mais l'ancien fonctionne correctement . je veux juste voir si le role est bien enregistré dans la base de données et si le token contient bien le role . et aussi voir si le role est bien renvoyé au frontend . je vais faire des tests et je te tiens au courant . merci pour ton aide .
// const { OAuth2Client } = require('google-auth-library');
// // const jwt = require('jsonwebtoken');

// // Utilisez votre propre Client ID Google
// const client = new OAuth2Client("385666932569-dj85vhevi0drutqt82rv1vc6ffnbuo7a.apps.googleusercontent.com");

// async function googleLogin(req, res) {
//   try {
//     const { token } = req.body; // Seul le token est nécessaire !

//     if (!token) {
//       return res.status(400).json({ message: "Jeton Google manquant" });
//     }

//     // 1. Validation et décodage sécurisé du jeton Google côté serveur
//     const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: "385666932569-dj85vhevi0drutqt82rv1vc6ffnbuo7a.apps.googleusercontent.com",
//     });
    
//     const payloadGoogle = ticket.getPayload();
//     const googleEmail = payloadGoogle.email.toLowerCase().trim();
//     const googleName = payloadGoogle.name;

//     const db = await connectDB();

//     // 2. Recherche en BDD avec l'e-mail extrait du jeton Google
//     const [existingUsers] = await db.execute(
//       "SELECT id, name, email, role FROM users WHERE LOWER(email) = ?",
//       [googleEmail]
//     );

//     let user;
//     if (existingUsers.length > 0) {
//       user = existingUsers[0];
//       console.log(`[BACKEND] Utilisateur trouvé. Rôle BDD : ${user.role}`);
//     } else {
//       // Création automatique si absent
//       const [result] = await db.execute(
//         "INSERT INTO users (name, email, provider, role) VALUES (?, ?, 'google', 'user')",
//         [googleName, googleEmail]
//       );
//       user = { id: result.insertId, name: googleName, email: googleEmail, role: "user" };
//     }

//     // 3. Génération du JWT de VOTRE application
//     const appToken = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || "VOTRE_CLE_SECRETE",
//       { expiresIn: "24h" }
//     );

//     // 4. Envoi de la réponse complète
//     return res.status(200).json({
//       message: "Authentification Google réussie",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role || "user",
//         isAdmin: (user.role === "admin")
//       },
//       token: appToken
//     });

//   } catch (error) {
//     console.error("Erreur googleLogin :", error);
//     return res.status(500).json({ message: "Erreur serveur lors de la connexion Google" });
//   }
// }

/**
 * Connexion / inscription via Google (Google OAuth)
 */
async function googleLogin(req, res) {
  try {
    const { token, email, name } = req.body;

    if (!token || !email || !name) {
      return res
        .status(400)
        .json({ message: "Jeton et infos utilisateur requis" });
    }

    // ✅ CORRECTION 1 : On force l'e-mail reçu en minuscules
    const cleanEmail = email.toLowerCase().trim();


    const db = await connectDB();

    // 🔍 Vérifie si l'utilisateur existe déjà (inclut le rôle)
    const [existingUsers] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?",
      [cleanEmail],
    );

    let user;
    let isCreated = false;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      console.log(`Utilisateur Google déjà existant : ${cleanEmail}`);
    } else {
      // ✅ Crée l'utilisateur avec role = 'user' par défaut
      const [result] = await db.execute(
        "INSERT INTO users (name, email, provider, role) VALUES (?, ?, 'google', 'user')",
        [name, cleanEmail],
      );

      const [newUser] = await db.execute(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [result.insertId],
      );
      user = newUser[0];
      isCreated = true;
      console.log(`Nouvel utilisateur Google créé : ${cleanEmail}`);
    }

    // 📦 JWT avec le rôle
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user", // 👈 Utilise le rôle de la BDD
    };

    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
     // ✅ CORRECTION 3 : Log de contrôle strict avant envoi
    console.log("🔍 Rôle extrait de la BDD :", user.role);
    console.log("🔍 Rôle renvoyé au frontend:", user.role || "user");
    console.log("🔍 isAdmin calculé:", (user.role || "user") === "admin");
    return res.status(200).json({
      message: isCreated
        ? "Utilisateur Google créé et connecté avec succès"
        : "Utilisateur Google connecté avec succès",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user", // 👈 Rôle renvoyé
        isAdmin: (user.role || "user") === "admin", // ajouter
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Erreur dans googleLogin :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la connexion Google" });
  }
}

/**
 * Connexion normale avec email/mot de passe
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Veuillez remplir tous les champs" });
    }

    const db = await connectDB();

    // 🔍 Sélection inclut maintenant le rôle
    const [users] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];

    if (!user.password) {
      return res.status(400).json({
        message: "Ce compte a été créé avec un fournisseur externe",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    // 📦 JWT avec le rôle
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user", // 👈 Rôle depuis la BDD
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user", // 👈 Rôle renvoyé au frontend
        isAdmin: (user.role || "user") === "admin", // ajouter
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { registerUser, googleLogin, loginUser };
