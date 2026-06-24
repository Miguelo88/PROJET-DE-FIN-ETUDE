// Route pour mettre à jour le profil de l'utilisateur
router.put("/api/users/update", async (req, res) => {
  try {
    const { id, firstName, lastName, email, birthDate, phone } = req.body;

    if (!id || !email || !firstName) {
      return res.status(400).json({ success: false, message: "Données obligatoires manquantes." });
    }

    // Nettoyage du numéro de téléphone pour ne garder que les chiffres (car votre colonne est un INT)
    const cleanPhone = phone ? phone.replace(/\D/g, "") : null;

    // Requête SQL de mise à jour (Adaptez 'db.query' selon votre connecteur mysql ou mysql2)
    const sql = `
      UPDATE users 
      SET name = ?, lastname = ?, email = ?, birthDate = ?, phone = ? 
      WHERE id = ?
    `;

    db.query(sql, [firstName, lastName, email, birthDate || null, cleanPhone, id], (err, result) => {
      if (err) {
        console.error("Erreur SQL lors de la mise à jour du profil:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ success: false, message: "Cet email est déjà utilisé par un autre compte." });
        }
        return res.status(500).json({ success: false, message: "Erreur lors de la sauvegarde." });
      }

      // Renvoyer l'utilisateur mis à jour pour rafraîchir la session locale
      return res.json({
        success: true,
        message: "Profil mis à jour en base de données avec succès.",
        user: {
          id,
          name: firstName,
          lastname: lastName,
          email,
          birthDate,
          phone: cleanPhone
        }
      });
    });

  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur de mise à jour." });
  }
});
