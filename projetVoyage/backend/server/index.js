const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 1. IMPORTATION DE LA CONFIGURATION WHATSAPP
const { connecterWhatsApp } = require("./config/whatsapp"); 


const authRoutes = require("./routes/authRoutes");
const flightsRoutes = require("./routes/flightsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const usersRoutes = require("./routes/users");
require("./config/connexionBD"); // ← ta connexion déjà prête à la base
const favoritesRoutes = require("./routes/favorites");

const app = express();
// Activer le robot de surveillance de prix nocturne
require("./services/priceCron"); // Vérifiez bien le chemin d'accès vers le fichier créé

const paymentRoutes =
require("./routes/paymentRoutes");
const reservationRoutes = require("./routes/reservationRoutes")



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
app.use("/api/users", usersRoutes);
app.use("/api/favorites", favoritesRoutes);

// NotchPay
app.use("/api/payment", paymentRoutes);

app.use("/api/reservations", reservationRoutes);
// Port unique utilisé par ton backend (React se connecte sur localhost:3000)
app.listen(3000, async () => {
  console.log("Serveur en cours d'exécution sur http://localhost:3000");
  // 2. INITIALISATION DE WHATSAPP AU DÉMARRAGE DU SERVEUR
  // try {
  //   console.log("⏳ Initialisation de la passerelle WhatsApp...");
  //   await connecterWhatsApp(); 
  // } catch (error) {
  //   console.error("❌ Impossible d'initialiser WhatsApp au démarrage :", error);
  // }

});
