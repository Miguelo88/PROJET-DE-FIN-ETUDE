const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { registerUser } = require("./controllers/authController");
require("./config/connexionBD");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// Route de test
app.get("/test", (req, res) => {
  res.json({ message: "Backend OK" });
});

// test avec le registre

// app.use("/register", registerUser);

// Routes d'authentification
// app.post("/api/auth", authRoutes); // je vais rremplacer use par post

// Commentez ou supprimez cette ligne temporairement :
// app.use("/api/auth", authRoutes);

// Ajoutez cette ligne juste en dessous :
app.post("/api/auth/register", registerUser);

app.listen(3000, () => {
  console.log("Serveur en cours d'exécution sur http://localhost:3000");
});


// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/connexionBD");
// const { registerUser } = require("./controllers/authController");

// const app = express();

// app.use(cors({ origin: "http://localhost:5173" }));
// app.use(express.json());

// // Vos routes pointent vers les fonctions du contrôleur
// app.post("/register", registerUser);

// async function startServer() {
//   try {
//     // On s'assure que la BDD fonctionne avant de lancer Express
//     await connectDB();

//     app.listen(3000, () => {
//       console.log("Server running on http://localhost:3000");
//     });
//   } catch (err) {
//     console.error("Impossible de démarrer le serveur :", err);
//   }
// }

// startServer();
