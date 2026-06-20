// routes/favorites.js
const express = require("express");
const jwt = require("jsonwebtoken");
const connexionDB = require("../config/connexionBD");
const router = express.Router();

// Helper pour récupérer l'user_id du token
function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.id; // suppose que ton token contient { id: user_id }
  } catch {
    return null;
  }
}

// POST /api/favorites : ajouter un favori
router.post('/', async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: 'Auth requise' });

  const { vol_id, origin, destination, price } = req.body;
  if (!vol_id) return res.status(400).json({ error: 'vol_id requis' });

  try {
    // ✅ Étape 1 : Obtenir l'instance de la connexion active
    const db = await connexionDB();

        // 🔍 Étape 2 : Vérifier si le favori existe déjà (Correction de la destructuration)
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS total FROM favorites WHERE user_id = ? AND vol_id = ?",
      [user_id, vol_id]
    );
    // Dans mysql2, rows est un tableau d'objets (ex: [ { total: 0 } ])
    const total = rows[0]?.total || 0;
    console.log(`[FAVORIS BDD] Vérification doublon. ID Utilisateur: ${user_id}, Vol: ${vol_id}, Trouvé: ${total}`);

    if (total > 0) {
      return res.status(409).json({ message: "Ce vol est déjà dans vos favoris" });


    // // rows[0].total contient la valeur numérique renvoyée par MySQL (ex: 0 ou 1)
    // (existi if (rows[0] && rows[0].total > 0) {
    //   return res.status(409).json({ message: "Ce vol est déjà dans vos favoris" });
    }


    // // 🔍 Étape 2 : Vérifier si le favori existe déjà pour éviter les doublons
    // const [existing] = await db.execute(
    //   "SELECT favorite_id FROM favorites WHERE user_id = ? AND vol_id = ?",
    //   [user_id, vol_id]
    // );

    // ifng.length > 0) {
    //   return res.status(409).json({ message: "Ce vol est déjà dans vos favoris" });
    // }

    // 🔄 2. Début d'une transaction pour s'assurer que les deux écritures réussissent ensemble
    await db.beginTransaction();

    // 💾 A. Insertion dans la table des favoris
    await db.query(
      `INSERT INTO favorites (user_id, vol_id) VALUES (?, ?)`,
      [user_id, vol_id]
    );

    // 🔔 B. Insertion automatique dans votre table 'alerte'
    const routeLabel = `${origin || 'Départ'} - ${destination || 'Arrivée'}`;
    const today = new Date().toISOString().split('T')[0]; // Format SQL YYYY-MM-DD
    
    await db.query(
      `INSERT INTO alerte (prixCible, route, active, dateCreation, vol_id, user_id) 
       VALUES (?, ?, 1, ?, ?, ?)`,
      [price || 0, routeLabel, today, vol_id, user_id]
    );

    // 🏁 ✅ Validation de la transaction si tout est OK
    await db.commit();

    console.log(`[SUCCÈS] Vol ${vol_id} ajouté aux favoris + Alerte créée pour l'utilisateur ${user_id}`);
    return res.json({ success: true, message: "Favori sauvegardé et alerte prix activée ! 🔔" });


    // 💾 Étape 3 : Insérer en base de données
    const [result] = await db.query(
      `INSERT INTO favorites (user_id, vol_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [user_id, vol_id]
    );
    console.log("[FAVORIS BDD] ✅ Insertion réussie ! Lignes affectées :", result.affectedRows);
    
    return res.json({ success: true, insertId: result.insertId });

  } catch (err) {
    console.error("❌ Erreur SQL ou Serveur lors du POST favori :", err);
    // ↩️ En cas de plantage, on annule tout pour éviter les données corrompues
    console.error("❌ Erreur lors de la création Favori + Alerte :", err);
    return res.status(500).json({ error: err.message, message: "Erreur interne du serveur lors de l'ajout" });
  }
});

// DELETE /api/favorites/:vol_id : supprimer un favori
router.delete('/:vol_id', async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: 'Auth requise' });

  const vol_id = req.params.vol_id;
  try {
    // ✅ Obtenir l'instance de la connexion active
    const db = await connexionDB();

    await db.query(`DELETE FROM favorites WHERE user_id = ? AND vol_id = ?`, [user_id, vol_id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur SQL ou Serveur lors du DELETE favori :", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/favorites : récupérer les favoris de l'user
router.get('/', async (req, res) => {
  const user_id = getUserIdFromToken(req);
  if (!user_id) return res.status(401).json({ error: 'Auth requise' });

  try {
    // ✅ Obtenir l'instance de la connexion active
    const db = await connexionDB();

    const favs = await db.query(
      `SELECT vol_id FROM favorites WHERE user_id = ?`,
      [user_id]
    );
    
    // favs[0] contient les lignes de résultats SQL
    return res.json({ favorites: favs[0].map(r => r.vol_id) });
  } catch (err) {
    console.error("❌ Erreur SQL ou Serveur lors du GET favori :", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;



// // routes/favorites.js
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const connexionDB = require("../config/connexionBD");
// const router = express.Router();

// // Helper pour récupérer l'user_id du token
// function getUserIdFromToken(req) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return null;
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     return payload.id; // suppose que ton token contient { id: user_id }
//   } catch {
//     return null;
//   }
// }

// // POST /api/favorites : ajouter un favori
// router.post('/', async (req, res) => {
//   const user_id = getUserIdFromToken(req);
//   if (!user_id) return res.status(401).json({ error: 'Auth requise' });

//   const { vol_id } = req.body;
//   if (!vol_id) return res.status(400).json({ error: 'vol_id requis' });

//   // 🔍 Optionnel : Vérifier si le favori existe déjà pour éviter les doublons
//     const [existing] = await connexionDB.execute(
//       "SELECT id FROM favorites WHERE user_id = ? AND vol_id = ?",
//       [user_id, vol_id]
//     );

//     if (existing.length > 0) {
//       return res.status(409).json({ message: "Ce vol est déjà dans vos favoris" });
//     }
    
//   try {
//     const [result] = await connexionDB.query(
//       `INSERT INTO favorites (user_id, vol_id) VALUES (?, ?)
//        ON DUPLICATE KEY UPDATE user_id = user_id`,
//       [user_id, vol_id]
//     );
//     res.json({ success: true, insertId: result.insertId });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//     // 🔴 Crucial : ce log vous dira exactement pourquoi la BDD rejette la requête !
//     console.error("❌ Erreur SQL ou Serveur lors du POST favori :", err);
//     return res.status(500).json({ message: "Erreur interne du serveur lors de l'ajout" });
//   }
// });

// // DELETE /api/favorites/:vol_id : supprimer un favori
// router.delete('/:vol_id', async (req, res) => {
//   const user_id = getUserIdFromToken(req);
//   if (!user_id) return res.status(401).json({ error: 'Auth requise' });

//   const vol_id = req.params.vol_id;
//   try {
//     await connexionDB.query(`DELETE FROM favorites WHERE user_id = ? AND vol_id = ?`, [user_id, vol_id]);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/favorites : récupérer les favoris de l'user
// router.get('/', async (req, res) => {
//   const user_id = getUserIdFromToken(req);
//   if (!user_id) return res.status(401).json({ error: 'Auth requise' });

//   try {
//     const favs = await connexionDB.query(
//       `SELECT vol_id FROM favorites WHERE user_id = ?`,
//       [user_id]
//     );
//     res.json({ favorites: favs[0].map(r => r.vol_id) });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports= router;