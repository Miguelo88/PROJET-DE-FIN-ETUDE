const express = require("express");
const connectDB = require("../config/connexionBD");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.use(authenticateToken, requireAdmin);

const mapUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  isAdmin: row.role === "admin",
  blocked: row.role === "blocked",
  registrationDate: row.created_at,
});

const mapFlightRow = (row) => ({
  id: row.id,
  airline: row.airline || "Compagnie inconnue",
  departureCity: row.departureCity,
  arrivalCity: row.arrivalCity,
  departureTime: row.departureTime,
  arrivalTime: row.arrivalTime,
  price: Number(row.price) || 0,
  duration: row.duration,
  stops: Number(row.stops) || 0,
  hidden: row.source === "hidden",
  source: row.source,
});

router.get("/dashboard", async (req, res) => {
  try {
    const db = await connectDB();

    const [[userCounts]] = await db.execute(
      `SELECT
        COUNT(*) AS totalUsers,
        SUM(role = 'admin') AS totalAdmins,
        SUM(role = 'blocked') AS totalBlocked
      FROM users`,
    );

    const [[flightCounts]] = await db.execute(
      `SELECT COUNT(*) AS totalFlights FROM vol`,
    );

    const [[alertCounts]] = await db.execute(
      `SELECT COUNT(*) AS totalAlerts FROM alerte`,
    );

    return res.json({
      totalUsers: Number(userCounts.totalUsers),
      totalAdmins: Number(userCounts.totalAdmins),
      totalBlocked: Number(userCounts.totalBlocked),
      totalFlights: Number(flightCounts.totalFlights),
      totalAlerts: Number(alertCounts.totalAlerts),
    });
  } catch (error) {
    console.error("Erreur admin dashboard :", error);
    return res.status(500).json({ message: "Erreur serveur admin dashboard" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC",
    );
    return res.json(rows.map(mapUserRow));
  } catch (error) {
    console.error("Erreur récupération des utilisateurs :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur récupération utilisateurs" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const { action } = req.body;

    const [rows] = await db.execute("SELECT role FROM users WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const currentRole = rows[0].role || "user";
    let newRole;

    switch (action) {
      case "toggleAdmin":
        newRole = currentRole === "admin" ? "user" : "admin";
        break;
      case "toggleBlock":
        newRole = currentRole === "blocked" ? "user" : "blocked";
        break;
      default:
        return res.status(400).json({ message: "Action invalide" });
    }

    await db.execute("UPDATE users SET role = ? WHERE id = ?", [newRole, id]);

    const [updatedRows] = await db.execute(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id],
    );

    return res.json(mapUserRow(updatedRows[0]));
  } catch (error) {
    console.error("Erreur de mise à jour utilisateur :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur mise à jour utilisateur" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("Erreur suppression utilisateur :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur suppression utilisateur" });
  }
});

router.get("/flights", async (req, res) => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(
      `SELECT
        v.vol_id AS id,
        c.nom_compagnie AS airline,
        v.depart AS departureCity,
        v.arrivee AS arrivalCity,
        DATE_FORMAT(v.heureDepart, "%H:%i") AS departureTime,
        DATE_FORMAT(v.heureArrivee, "%H:%i") AS arrivalTime,
        TIMESTAMPDIFF(MINUTE, v.heureDepart, v.heureArrivee) AS durationMinutes,
        v.nbEscales AS stops,
        t.prix AS price,
        v.source AS source
      FROM vol v
      LEFT JOIN compagnie c ON c.compagnie_id = v.compagnie_id
      LEFT JOIN tarif t ON t.vol_id = v.vol_id
      ORDER BY v.vol_id DESC`,
    );

    const flights = rows.map((row) => ({
      ...mapFlightRow(row),
      duration:
        row.durationMinutes != null
          ? `${Math.floor(row.durationMinutes / 60)}h ${row.durationMinutes % 60}m`
          : "N/A",
    }));

    return res.json(flights);
  } catch (error) {
    console.error("Erreur récupération des vols admin :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur récupération vols" });
  }
});

router.post("/flights", async (req, res) => {
  try {
    const db = await connectDB();
    const {
      airline,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
      duration,
      stops,
    } = req.body;

    const today = new Date().toISOString().slice(0, 10);
    const departureDateTime = `${today} ${departureTime || "00:00"}:00`;
    const arrivalDateTime = `${today} ${arrivalTime || "00:00"}:00`;

    const [companyRows] = await db.execute(
      "SELECT compagnie_id FROM compagnie WHERE nom_compagnie = ?",
      [airline],
    );

    let compagnieId;
    if (companyRows.length > 0) {
      compagnieId = companyRows[0].compagnie_id;
    } else {
      const [maxComp] = await db.execute(
        "SELECT COALESCE(MAX(compagnie_id), 0) AS maxId FROM compagnie",
      );
      const nextCompagnieId = Number(maxComp[0].maxId) + 1;
      const code = airline
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, "X");
      await db.execute(
        "INSERT INTO compagnie (compagnie_id, code_IATA, nom_compagnie, pays, logo) VALUES (?, ?, ?, ?, ?)",
        [nextCompagnieId, code, airline, "N/A", null],
      );
      compagnieId = nextCompagnieId;
    }

    const [maxVol] = await db.execute(
      "SELECT COALESCE(MAX(vol_id), 100) AS maxId FROM vol",
    );
    const volId = Number(maxVol[0].maxId) + 1;

    await db.execute(
      "INSERT INTO vol (vol_id, compagnie_id, depart, arrivee, heureDepart, heureArrivee, nbEscales, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        volId,
        compagnieId,
        departureCity,
        arrivalCity,
        departureDateTime,
        arrivalDateTime,
        stops || 0,
        "admin",
      ],
    );

    const [maxTarif] = await db.execute(
      "SELECT COALESCE(MAX(tarif_id), 0) AS maxId FROM tarif",
    );
    const tarifId = Number(maxTarif[0].maxId) + 1;

    await db.execute(
      "INSERT INTO tarif (tarif_id, prix, devise, taxesIncluses, bagagesInclus, vol_id) VALUES (?, ?, ?, ?, ?, ?)",
      [tarifId, price || 0, "EUR", 1, 1, volId],
    );

    const newFlight = {
      id: volId,
      airline,
      departureCity,
      arrivalCity,
      departureTime: departureTime || "00:00",
      arrivalTime: arrivalTime || "00:00",
      price: Number(price) || 0,
      duration: duration || "N/A",
      stops: Number(stops) || 0,
      hidden: false,
      source: "admin",
    };

    return res.status(201).json(newFlight);
  } catch (error) {
    console.error("Erreur création vol admin :", error);
    return res.status(500).json({ message: "Erreur serveur création vol" });
  }
});

router.patch("/flights/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const {
      airline,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      price,
      duration,
      stops,
      hidden,
    } = req.body;

    const [flightRows] = await db.execute(
      "SELECT vol_id, compagnie_id FROM vol WHERE vol_id = ?",
      [id],
    );
    if (flightRows.length === 0) {
      return res.status(404).json({ message: "Vol non trouvé" });
    }

    const source = hidden ? "hidden" : "admin";

    if (airline) {
      const [companyRows] = await db.execute(
        "SELECT compagnie_id FROM compagnie WHERE nom_compagnie = ?",
        [airline],
      );
      if (companyRows.length > 0) {
        await db.execute("UPDATE vol SET compagnie_id = ? WHERE vol_id = ?", [
          companyRows[0].compagnie_id,
          id,
        ]);
      }
    }

    const updates = [];
    const values = [];

    if (departureCity) {
      updates.push("depart = ?");
      values.push(departureCity);
    }
    if (arrivalCity) {
      updates.push("arrivee = ?");
      values.push(arrivalCity);
    }
    if (departureTime) {
      const today = new Date().toISOString().slice(0, 10);
      updates.push("heureDepart = ?");
      values.push(`${today} ${departureTime}:00`);
    }
    if (arrivalTime) {
      const today = new Date().toISOString().slice(0, 10);
      updates.push("heureArrivee = ?");
      values.push(`${today} ${arrivalTime}:00`);
    }
    if (stops != null) {
      updates.push("nbEscales = ?");
      values.push(stops);
    }
    if (source) {
      updates.push("source = ?");
      values.push(source);
    }

    if (updates.length > 0) {
      values.push(id);
      await db.execute(
        `UPDATE vol SET ${updates.join(", ")} WHERE vol_id = ?`,
        values,
      );
    }

    if (price != null) {
      await db.execute("UPDATE tarif SET prix = ? WHERE vol_id = ?", [
        price,
        id,
      ]);
    }

    const [updatedFlights] = await db.execute(
      `SELECT
        v.vol_id AS id,
        c.nom_compagnie AS airline,
        v.depart AS departureCity,
        v.arrivee AS arrivalCity,
        DATE_FORMAT(v.heureDepart, "%H:%i") AS departureTime,
        DATE_FORMAT(v.heureArrivee, "%H:%i") AS arrivalTime,
        TIMESTAMPDIFF(MINUTE, v.heureDepart, v.heureArrivee) AS durationMinutes,
        v.nbEscales AS stops,
        t.prix AS price,
        v.source AS source
      FROM vol v
      LEFT JOIN compagnie c ON c.compagnie_id = v.compagnie_id
      LEFT JOIN tarif t ON t.vol_id = v.vol_id
      WHERE v.vol_id = ?`,
      [id],
    );

    if (updatedFlights.length === 0) {
      return res
        .status(404)
        .json({ message: "Vol non trouvé après mise à jour" });
    }

    const row = updatedFlights[0];
    return res.json({
      ...mapFlightRow(row),
      duration:
        row.durationMinutes != null
          ? `${Math.floor(row.durationMinutes / 60)}h ${row.durationMinutes % 60}m`
          : duration || "N/A",
    });
  } catch (error) {
    console.error("Erreur mise à jour vol admin :", error);
    return res.status(500).json({ message: "Erreur serveur mise à jour vol" });
  }
});

router.delete("/flights/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.execute("DELETE FROM tarif WHERE vol_id = ?", [id]);
    await db.execute("DELETE FROM vol WHERE vol_id = ?", [id]);

    return res.json({ message: "Vol supprimé" });
  } catch (error) {
    console.error("Erreur suppression vol admin :", error);
    return res.status(500).json({ message: "Erreur serveur suppression vol" });
  }
});

module.exports = router;
