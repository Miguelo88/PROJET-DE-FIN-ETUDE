const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const flightsRoutes = require("./routes/flightsRoutes");
const adminRoutes = require("./routes/adminRoutes");
require("./config/connexionBD"); // ← ta connexion déjà prête à la base

const app = express();

// Autorisation du frontend React/Vite
app.use(
  cors({
    origin: "http://localhost:5173", // adapt si tu changes de port
  }),
);

// Parser le JSON
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightsRoutes);
app.use("/api/admin", adminRoutes);

// Port unique utilisé par ton backend (React se connecte sur localhost:3000)
app.listen(3000, () => {
  console.log("Serveur en cours d'exécution sur http://localhost:3000");
});

// const express = require("express");
// const cors = require("cors");
// const authRoutes = require("./routes/authRoutes");
// const { registerUser } = require("./controllers/authController");
// require("./config/connexionBD");

// // Ajout pour Google Auth
// const { OAuth2Client } = require("google-auth-library");

// const app = express();

// // CORS autorisé depuis Vite React
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );
// app.use(express.json());

// // Route de test
// app.get("/test", (req, res) => {
//   res.json({ message: "Backend OK" });
// });

// // Google Auth (Google Login / Register via Google)
// const CLIENT_ID = "385666932569-dj85vhevi0drutqt82rv1vc6ffnbuo7a.apps.googleusercontent.com"; // ← à remplacer
// const client = new OAuth2Client(CLIENT_ID);

// app.post("/api/auth/google", async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ message: "Jeton manquant" });
//   }

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     const userId = payload["sub"];    // ID Google unique
//     const email = payload["email"];
//     const name = payload["name"];
//     const picture = payload["picture"];

//     console.log(`Utilisateur vérifié : ${name} (${email})`);

//     // ÉTAPE LOGIQUE DE VOTRE PROJET :
//     // 1. Chercher si l'utilisateur existe déjà dans votre base de données avec cet email.
//     // 2. S'il n'existe pas, le créer automatiquement (Inscription automatique).
//     // 3. Générer votre propre JWT pour sécuriser la session sur votre site.
//     // → À COMPLÉTER avec ton code (ex: dans un autre contrôleur que registerUser)

//     res.status(200).json({
//       message: "Authentification Google réussie",
//       user: { id: userId, email, name, picture },
//     });
//   } catch (error) {
//     console.error("Erreur lors de la vérification Google :", error);
//     res.status(401).json({ message: "Jeton Google invalide ou expiré" });
//   }
// });

// // Routes d'authentification existantes
// app.post("/api/auth/register", registerUser);

// // Si tu as d'autres routes d'auth (login, logout, etc.)
// // app.use("/api/auth", authRoutes); // ou la route que tu utilises

// // PORT unique pour tout le backend
// app.listen(3000, () => {
//   console.log("Serveur en cours d'exécution sur http://localhost:3000");
// });

// const express = require("express");
// const cors = require("cors");
// const authRoutes = require("./routes/authRoutes");
// const { registerUser } = require("./controllers/authController");
// require("./config/connexionBD");

// const app = express();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//   })
// );
// app.use(express.json());

// // Route de test
// app.get("/test", (req, res) => {
//   res.json({ message: "Backend OK" });
// });

// // test avec le registre

// // app.use("/register", registerUser);

// // Routes d'authentification
// // app.post("/api/auth", authRoutes); // je vais rremplacer use par post

// // Commentez ou supprimez cette ligne temporairement :
// // app.use("/api/auth", authRoutes);

// // Ajoutez cette ligne juste en dessous :
// app.post("/api/auth/register", registerUser);

// app.listen(3000, () => {
//   console.log("Serveur en cours d'exécution sur http://localhost:3000");
// });

// // const express = require("express");
// // const cors = require("cors");
// // const connectDB = require("./config/connexionBD");
// // const { registerUser } = require("./controllers/authController");

// // const app = express();

// // app.use(cors({ origin: "http://localhost:5173" }));
// // app.use(express.json());

// // // Vos routes pointent vers les fonctions du contrôleur
// // app.post("/register", registerUser);

// // async function startServer() {
// //   try {
// //     // On s'assure que la BDD fonctionne avant de lancer Express
// //     await connectDB();

// //     app.listen(3000, () => {
// //       console.log("Server running on http://localhost:3000");
// //     });
// //   } catch (err) {
// //     console.error("Impossible de démarrer le serveur :", err);
// //   }
// // }

// // startServer();
