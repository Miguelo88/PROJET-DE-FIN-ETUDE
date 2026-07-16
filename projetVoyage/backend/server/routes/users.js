const express = require("express");
const router = express.Router();
const connectDB = require("../config/connexionBD");

// Route pour mettre à jour le profil de l'utilisateur
router.put("/update", async (req, res) => {
  try {
    const { id, firstName, lastName, email, birthDate, phone } = req.body;

    if (!id || !email || !firstName) {
      return res
        .status(400)
        .json({ success: false, message: "Données obligatoires manquantes." });
    }

    const db = await connectDB();
    const cleanPhone = phone ? String(phone).replace(/\D/g, "") : null;

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, id],
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cet email est déjà utilisé par un autre compte.",
        });
    }

    const sql = `
      UPDATE users
      SET name = ?, lastname = ?, email = ?, birthDate = ?, phone = ?
      WHERE id = ?
    `;

    await db.execute(sql, [
      firstName,
      lastName || null,
      email,
      birthDate || null,
      cleanPhone,
      id,
    ]);

    return res.json({
      success: true,
      message: "Profil mis à jour en base de données avec succès.",
      user: {
        id,
        name: firstName,
        lastname: lastName || null,
        email,
        birthDate: birthDate || null,
        phone: cleanPhone,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erreur serveur de mise à jour." });
  }
});

module.exports = router;
