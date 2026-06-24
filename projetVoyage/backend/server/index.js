const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const flightsRoutes = require("./routes/flightsRoutes");
const adminRoutes = require("./routes/adminRoutes");
require("./config/connexionBD"); // ← ta connexion déjà prête à la base
const favoritesRoutes = require("./routes/favorites");
const app = express();
// Activer le robot de surveillance de prix nocturne
require("./services/priceCron"); // Vérifiez bien le chemin d'accès vers le fichier créé


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
app.use("/api/favorites", favoritesRoutes);


// Port unique utilisé par ton backend (React se connecte sur localhost:3000)
app.listen(3000, () => {
  console.log("Serveur en cours d'exécution sur http://localhost:3000");
});
