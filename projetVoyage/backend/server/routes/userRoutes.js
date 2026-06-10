const express = require("express");
const router = express.Router();
const connectDB = require("../config/connexionBD");
const { authenticateToken } = require("../middleware/auth");

// Toutes les routes utilisateur nécessitent un JWT valide
router.use(authenticateToken);

// Récupère les informations du profil utilisateur
router.get("/me", async (req, res) => {
  try {
    const db = await connectDB();
    const [users] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = users[0];
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "admin",
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Erreur récupération profil utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Met à jour le profil utilisateur
router.patch("/me", async (req, res) => {
  try {
    const db = await connectDB();
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Nom et email requis" });
    }

    await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      req.user.id,
    ]);

    const [updatedUsers] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    const updatedUser = updatedUsers[0];
    return res.json({
      message: "Profil mis à jour",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.role === "admin",
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour profil utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprime le compte utilisateur et ses données propriétaires
router.delete("/me", async (req, res) => {
  try {
    const db = await connectDB();
    await db.execute("DELETE FROM alerte WHERE user_id = ?", [req.user.id]);
    await db.execute("DELETE FROM recherche WHERE user_id = ?", [req.user.id]);
    await db.execute("DELETE FROM users WHERE id = ?", [req.user.id]);
    return res.json({ message: "Compte supprimé" });
  } catch (error) {
    console.error("Erreur suppression compte utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupère les voyages / recherches enregistrées de l'utilisateur
router.get("/trips", async (req, res) => {
  try {
    const db = await connectDB();
    const [trips] = await db.execute(
      `SELECT
        r.recherche_id AS id,
        r.villeDepart AS \`from\`,
        r.villeArrivee AS \`to\`,
        r.dateAller AS departureDate,
        r.dateRetour AS returnDate,
        r.classe AS travelClass,
        r.nbPassagers AS passengers,
        COALESCE(t.prix, 0) AS price,
        v.heureDepart AS departureTime,
        v.heureArrivee AS arrivalTime,
        c.nom_compagnie AS airline,
        v.depart AS departAirport,
        v.arrivee AS arrivalAirport
      FROM recherche r
      LEFT JOIN vol v ON v.vol_id = r.vol_id
      LEFT JOIN tarif t ON t.vol_id = v.vol_id
      LEFT JOIN compagnie c ON c.compagnie_id = v.compagnie_id
      WHERE r.user_id = ?
      ORDER BY r.recherche_id DESC`,
      [req.user.id],
    );

    return res.json(
      trips.map((trip) => ({
        ...trip,
        status:
          trip.departureDate && new Date(trip.departureDate) >= new Date()
            ? "Confirmé"
            : "Terminé",
      })),
    );
  } catch (error) {
    console.error("Erreur récupération voyages utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupère les favoris de l'utilisateur stockés en base
router.get("/favorites", async (req, res) => {
  try {
    const db = await connectDB();
    const [favorites] = await db.execute(
      `SELECT
        r.recherche_id AS id,
        r.villeDepart AS \`from\`,
        r.villeArrivee AS \`to\`,
        r.dateAller AS departureDate,
        r.dateRetour AS returnDate,
        r.classe AS travelClass,
        r.nbPassagers AS passengers,
        COALESCE(t.prix, 0) AS price,
        v.heureDepart AS departureTime,
        v.heureArrivee AS arrivalTime,
        c.nom_compagnie AS airline
      FROM recherche r
      LEFT JOIN vol v ON v.vol_id = r.vol_id
      LEFT JOIN tarif t ON t.vol_id = v.vol_id
      LEFT JOIN compagnie c ON c.compagnie_id = v.compagnie_id
      WHERE r.user_id = ?
      ORDER BY r.recherche_id DESC`,
      [req.user.id],
    );

    return res.json(favorites);
  } catch (error) {
    console.error("Erreur récupération favoris utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprime un favori utilisateur
router.delete("/favorites/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const favoriteId = req.params.id;

    const [result] = await db.execute(
      "DELETE FROM recherche WHERE recherche_id = ? AND user_id = ?",
      [favoriteId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Favori introuvable" });
    }

    return res.json({ message: "Favori supprimé" });
  } catch (error) {
    console.error("Erreur suppression favori utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupère les alertes de prix de l'utilisateur
router.get("/alerts", async (req, res) => {
  try {
    const db = await connectDB();
    const [alerts] = await db.execute(
      `SELECT
        a.alerte_id AS id,
        a.prixCible AS target,
        a.route AS route,
        a.active AS active,
        a.dateCreation AS dateCreated,
        v.depart AS departAirport,
        v.arrivee AS arrivalAirport,
        c.nom_compagnie AS airline
      FROM alerte a
      LEFT JOIN vol v ON v.vol_id = a.vol_id
      LEFT JOIN compagnie c ON c.compagnie_id = v.compagnie_id
      WHERE a.user_id = ?
      ORDER BY a.alerte_id DESC`,
      [req.user.id],
    );

    return res.json(
      alerts.map((alert) => ({
        ...alert,
        description: alert.route || "Alerte de prix personnalisée",
        active: Boolean(alert.active),
      })),
    );
  } catch (error) {
    console.error("Erreur récupération alertes utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Crée une alerte de prix
router.post("/alerts", async (req, res) => {
  try {
    const db = await connectDB();
    const { route, target, volId } = req.body;

    if (!route || !target) {
      return res.status(400).json({ message: "Route et prix cible requis" });
    }

    const [maxIdRows] = await db.execute(
      "SELECT COALESCE(MAX(alerte_id), 0) AS maxId FROM alerte",
    );
    const nextId = Number(maxIdRows[0].maxId) + 1;

    await db.execute(
      "INSERT INTO alerte (alerte_id, prixCible, route, active, dateCreation, vol_id, user_id) VALUES (?, ?, ?, 1, CURDATE(), ?, ?)",
      [nextId, target, route, volId || null, req.user.id],
    );

    const [newAlerts] = await db.execute(
      "SELECT a.alerte_id AS id, a.prixCible AS target, a.route AS route, a.active AS active, a.dateCreation AS dateCreated FROM alerte a WHERE a.alerte_id = ?",
      [nextId],
    );

    return res.status(201).json({
      alert: {
        ...newAlerts[0],
        description: route,
        active: Boolean(newAlerts[0].active),
      },
    });
  } catch (error) {
    console.error("Erreur création alerte utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprime une alerte de prix
router.delete("/alerts/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const alertId = req.params.id;

    const [result] = await db.execute(
      "DELETE FROM alerte WHERE alerte_id = ? AND user_id = ?",
      [alertId, req.user.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alerte introuvable" });
    }

    return res.json({ message: "Alerte supprimée" });
  } catch (error) {
    console.error("Erreur suppression alerte utilisateur :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// Réserver un vol : s'assure que compagnie, vol, tarif existent puis crée une recherche
// router.post("/book", async (req, res) => {
//   let db;
//   try {
//     db = await connectDB();
//     const userId = req.user.id;
//     const {
//       airline,
//       origin,
//       destination,
//       departureDate,
//       departureTime,
//       arrivalDate,
//       arrivalTime,
//       price,
//       nbPassagers,
//       classe,
//     } = req.body;

//     if (!origin || !destination || !departureDate) {
//       return res
//         .status(400)
//         .json({ message: "Origin, destination and date required" });
//     }

//     await db.beginTransaction();

//     // Ensure compagnie
//     let compagnieId = null;
//     if (airline) {
//       const [compRows] = await db.execute(
//         "SELECT compagnie_id FROM compagnie WHERE nom_compagnie = ? LIMIT 1",
//         [airline],
//       );
//       if (compRows.length > 0) {
//         compagnieId = compRows[0].compagnie_id;
//       } else {
//         const [maxComp] = await db.execute(
//           "SELECT COALESCE(MAX(compagnie_id), 0) AS maxId FROM compagnie",
//         );
//         const nextCompagnieId = Number(maxComp[0].maxId) + 1;
//         const code = (airline || "UNK")
//           .replace(/[^A-Z0-9]/gi, "")
//           .toUpperCase()
//           .slice(0, 3)
//           .padEnd(3, "X");
//         await db.execute(
//           "INSERT INTO compagnie (compagnie_id, code_IATA, nom_compagnie, pays, logo) VALUES (?, ?, ?, ?, ?)",
//           [nextCompagnieId, code, airline, "N/A", null],
//         );
//         compagnieId = nextCompagnieId;
//       }
//     }

//     // Create vol
//     const [maxVol] = await db.execute(
//       "SELECT COALESCE(MAX(vol_id), 100) AS maxId FROM vol",
//     );
//     const volId = Number(maxVol[0].maxId) + 1;

//     const heureDepart = `${departureDate} ${departureTime || "00:00"}:00`;
//     const heureArrivee = arrivalDate
//       ? `${arrivalDate} ${arrivalTime || "00:00"}:00`
//       : null;

//     // await db.execute(
//     //   "INSERT INTO vol (vol_id, compagnie_id, depart, arrivee, heureDepart, heureArrivee, nbEscales, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//     //   [
//     //     volId,
//     //     compagnieId,
//     //     origin,
//     //     destination,
//     //     heureDepart,
//     //     heureArrivee,
//     //     0,
//     //     "user",
//     //   ],
//     // );

//     // À insérer dans userRoutes.js juste AVANT le "CREATE VOL" (vers la ligne 340)

//     // Extrait les 3 lettres majuscules entre parenthèses, ex: "El Prat (BCN)" -> "BCN"
//     const matchOrigin = origin ? origin.match(/\(([A-Z]{3})\)/) : null;
//     const matchDest = destination ? destination.match(/\(([A-Z]{3})\)/) : null;

//     const cleanOrigin = matchOrigin
//       ? matchOrigin[1]
//       : (origin || "UNK").slice(0, 3).toUpperCase();
//     const cleanDestination = matchDest
//       ? matchDest[1]
//       : (destination || "UNK").slice(0, 3).toUpperCase();

//     // Modifiez ensuite votre db.execute pour utiliser cleanOrigin et cleanDestination :
//     await db.execute(
//       "INSERT INTO vol (vol_id, compagnie_id, depart, arrivee, heureDepart, heureArrivee, nbEscales, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         volId,
//         compagnieId,
//         cleanOrigin, // Version corrigée sur 3 caractères
//         cleanDestination, // Version corrigée sur 3 caractères
//         heureDepart,
//         heureArrivee,
//         0,
//         "user",
//       ],
//     );

//     // Create tarif
//     const [maxTarif] = await db.execute(
//       "SELECT COALESCE(MAX(tarif_id), 0) AS maxId FROM tarif",
//     );
//     const tarifId = Number(maxTarif[0].maxId) + 1;
//     await db.execute(
//       "INSERT INTO tarif (tarif_id, prix, devise, taxesIncluses, bagagesInclus, vol_id) VALUES (?, ?, ?, ?, ?, ?)",
//       [tarifId, price || 0, "EUR", 1, 1, volId],
//     );

//     // Create recherche (reservation)
//     const [maxRecherche] = await db.execute(
//       "SELECT COALESCE(MAX(recherche_id), 0) AS maxId FROM recherche",
//     );
//     const rechercheId = Number(maxRecherche[0].maxId) + 1;

//     await db.execute(
//       "INSERT INTO recherche (recherche_id, villeDepart, villeArrivee, dateAller, dateRetour, nbPassagers, classe, vol_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         rechercheId,
//         origin,
//         destination,
//         departureDate,
//         arrivalDate || null,
//         nbPassagers || 1,
//         classe || "Economy",
//         volId,
//         userId,
//       ],
//     );

//     await db.commit();

//     return res.status(201).json({
//       message: "Réservation enregistrée",
//       reservation: {
//         rechercheId,
//         volId,
//         tarifId,
//         compagnieId,
//       },
//     });
//   } catch (error) {
//     console.error("Erreur création réservation utilisateur :", error);
//     try {
//       if (db) await db.rollback();
//     } catch (e) {
//       console.error("Rollback failed:", e);
//     }
//     return res.status(500).json({ message: "Erreur serveur" });
//   }
// });

// ==========================================
// RÉSERVER UN VOL
// S'assure que compagnie, vol, tarif existent puis crée une recherche
// ==========================================
router.post("/book", async (req, res) => {
  let db;
  try {
    db = await connectDB();
    const userId = req.user.id;
    const {
      airline,
      origin,
      destination,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      price,
      nbPassagers,
      classe,
    } = req.body;

    if (!origin || !destination || !departureDate) {
      return res
        .status(400)
        .json({ message: "Origin, destination and date required" });
    }

    await db.beginTransaction();

    // ==========================================
    // 1. GESTION DE LA COMPAGNIE (Sécurisée contre les doublons)
    // ==========================================
    let compagnieId = null;
    if (airline) {
      const [compRows] = await db.execute(
        "SELECT compagnie_id FROM compagnie WHERE nom_compagnie = ? LIMIT 1",
        [airline],
      );
      if (compRows.length > 0) {
        compagnieId = compRows[0].compagnie_id;
      } else {
        const [maxComp] = await db.execute(
          "SELECT COALESCE(MAX(compagnie_id), 0) AS maxId FROM compagnie",
        );
        const nextCompagnieId = Number(maxComp[0].maxId) + 1;
        const code = (airline || "UNK")
          .replace(/[^A-Z0-9]/gi, "")
          .toUpperCase()
          .slice(0, 3)
          .padEnd(3, "X");

        try {
          await db.execute(
            "INSERT INTO compagnie (compagnie_id, code_IATA, nom_compagnie, pays, logo) VALUES (?, ?, ?, ?, ?)",
            [nextCompagnieId, code, airline, "N/A", null],
          );
          compagnieId = nextCompagnieId;
        } catch (err) {
          // Si une requête parallèle a inséré la compagnie au même millième de seconde
          if (err.code === "ER_DUP_ENTRY") {
            const [retryRows] = await db.execute(
              "SELECT compagnie_id FROM compagnie WHERE nom_compagnie = ? LIMIT 1",
              [airline],
            );
            compagnieId = retryRows[0].compagnie_id;
          } else {
            throw err; // Relance l'erreur si c'est un autre problème
          }
        }
      }
    }

    // ==========================================
    // 2. EXTRACTION DU CODE AÉROPORT (3 Lettres)
    // ==========================================
    // Extrait "BCN" depuis "El Prat De Llobregat (BCN)"
    const matchOrigin = origin ? origin.match(/\(([A-Z]{3})\)/) : null;
    const matchDest = destination ? destination.match(/\(([A-Z]{3})\)/) : null;

    const cleanOrigin = matchOrigin
      ? matchOrigin[1]
      : (origin || "UNK").slice(0, 3).toUpperCase();
    const cleanDestination = matchDest
      ? matchDest[1]
      : (destination || "UNK").slice(0, 3).toUpperCase();

    // ==========================================
    // 3. CRÉATION DU VOL (Avec les variables corrigées)
    // ==========================================
    const [maxVol] = await db.execute(
      "SELECT COALESCE(MAX(vol_id), 100) AS maxId FROM vol",
    );
    const volId = Number(maxVol[0].maxId) + 1;

    const heureDepart = `${departureDate} ${departureTime || "00:00"}:00`;
    const heureArrivee = arrivalDate
      ? `${arrivalDate} ${arrivalTime || "00:00"}:00`
      : null;

    await db.execute(
      "INSERT INTO vol (vol_id, compagnie_id, depart, arrivee, heureDepart, heureArrivee, nbEscales, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        volId,
        compagnieId,
        cleanOrigin, // Version propre à 3 lettres (ex: BCN)
        cleanDestination, // Version propre à 3 lettres (ex: AMS)
        heureDepart,
        heureArrivee,
        0,
        "user",
      ],
    );

    // ==========================================
    // 4. CRÉATION DU TARIF
    // ==========================================
    const [maxTarif] = await db.execute(
      "SELECT COALESCE(MAX(tarif_id), 0) AS maxId FROM tarif",
    );
    const tarifId = Number(maxTarif[0].maxId) + 1;
    await db.execute(
      "INSERT INTO tarif (tarif_id, prix, devise, taxesIncluses, bagagesInclus, vol_id) VALUES (?, ?, ?, ?, ?, ?)",
      [tarifId, price || 0, "EUR", 1, 1, volId],
    );

    // ==========================================
    // 5. CRÉATION DE LA RECHERCHE (Réservation)
    // ==========================================
    const [maxRecherche] = await db.execute(
      "SELECT COALESCE(MAX(recherche_id), 0) AS maxId FROM recherche",
    );
    const rechercheId = Number(maxRecherche[0].maxId) + 1;

    await db.execute(
      "INSERT INTO recherche (recherche_id, villeDepart, villeArrivee, dateAller, dateRetour, nbPassagers, classe, vol_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        rechercheId,
        origin,
        destination,
        departureDate,
        arrivalDate || null,
        nbPassagers || 1,
        classe || "Economy",
        volId,
        userId,
      ],
    );

    await db.commit();

    return res.status(201).json({
      message: "Réservation enregistrée",
      reservation: {
        rechercheId,
        volId,
        tarifId,
        compagnieId,
      },
    });
  } catch (error) {
    console.error("Erreur création réservation utilisateur :", error);
    try {
      if (db) await db.rollback();
    } catch (e) {
      console.error("Rollback failed:", e);
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
});
module.exports = router;
