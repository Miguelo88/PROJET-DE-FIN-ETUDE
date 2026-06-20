const cron = require("node-cron");
const nodemailer = require("nodemailer");
const connexionDB = require("../config/connexionBD"); // Vérifiez le chemin vers votre config BD


// Nettoyage automatique des espaces et symboles parasites du .env
const cleanHost = process.env.EMAIL_HOST ? process.env.EMAIL_HOST.replace(/[:\s]/g, "") : "";

// ✉️ 1. Configuration du transporteur d'e-mails (Exemple avec Mailtrap pour les tests ou Gmail)
const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  host: cleanHost, // 👈 Utilise la variable nettoyée (ex: "smtp.gmail.com")
  port: process.env.EMAIL_PORT || 2525,
  secure: true, //👈 Force la connexion sécurisée SSL requise par Gmail
  auth: {
    user: process.env.EMAIL_USER, // À ajouter dans votre fichier .env
    pass: process.env.EMAIL_PASS, // À ajouter dans votre fichier .env
  },
});

/**
 * 🤖 Tâche Planifiée (Cron Job)
 * S'exécute automatiquement TOUTES LES NUITS à Minuit pile (00:00)
 */
cron.schedule("0 0 * * *", async () => {
  console.log(
    "🕛 [ROBOT CRON] Lancement de la vérification nocturne des prix...",
  );

  try {
    // Connexion à la base de données
    const db = await connexionDB();

    // 🔍 Récupérer toutes les alertes actives et joindre l'adresse e-mail de l'utilisateur
    const [alertes] = await db.execute(`
      SELECT a.*, u.email, u.name 
      FROM alerte a
      JOIN users u ON a.user_id = u.id
      WHERE a.active = 1
    `);

    if (!alertes || alertes.length === 0) {
      console.log(
        "ℹ️ [ROBOT CRON] Aucune alerte active à vérifier cette nuit.",
      );
      return;
    }

    console.log(
      `📊 [ROBOT CRON] ${alertes.length} alerte(s) active(s) détectée(s). Analyse en cours...`,
    );

    for (const alerte of alertes) {
      // 🕵️ Extraction de l'origine et destination depuis l'ID de vol (ex: "ORY-LAX-2026-06-20-0")
      const parts = alerte.vol_id ? alerte.vol_id.split("-") : [];
      if (parts.length < 4) {
        console.log(
          `⚠️ [ROBOT CRON] ID de vol mal formé pour l'alerte ID ${alerte.alerte_id}. Ignoré.`,
        );
        continue;
      }

      const origin = parts[0];
      const destination = parts[1];
      const departureDate = `${parts[2]}-${parts[3]}-${parts[4]}`; // Recrée "2026-06-20"

      let freshPrice = null;

      // 🌐 2. Simulation ou Appel API pour obtenir le prix frais du jour
      try {
        // Option A: Si vous voulez brancher vos vraies fonctions de l'API :
        // const prices = await fetchAviasalesPrice({ origin, destination, departureDate, token: process.env.TRAVELPAYOUTS_API_TOKEN });
        // freshPrice = prices[0]?.value || null;

        // Option B (Sécurisée pour vos tests) : Simulation automatique d'une baisse de prix
        // On simule que le prix d'aujourd'hui est inférieur de 25€ à son ancien prix cible
        freshPrice = Number(alerte.prixCible) - 25;
      } catch (apiError) {
        console.error(
          `❌ [ROBOT CRON] Impossible de contacter l'API de vols pour la route ${alerte.route}:`,
          apiError.message,
        );
        continue; // Passe à l'alerte suivante en cas de panne réseau
      }

      // 📉 3. Comparaison des prix : Est-ce que le vol est devenu moins cher ?
      if (freshPrice && freshPrice < Number(alerte.prixCible)) {
        console.log(
          `📉 Baisse de prix trouvée pour ${alerte.route} ! Ancien: ${alerte.prixCible}€ -> Nouveau: ${freshPrice}€`,
        );

        // ✉️ 4. Construction et envoi de l'e-mail d'alerte
        const mailOptions = {
          from: '"Alerte Vol Moins Cher" <noreply@projetvoyage.com>',
          to: alerte.email,
          subject: `📉 Grande baisse de prix sur votre vol ${origin} ➔ ${destination} !,dans le site TKSkySearch`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; rounded-xl;">
              <h2 style="color: #1d4ed8; text-align: center;">Bonne nouvelle ${alerte.name} ! 🎉</h2>
              <p>Le prix du vol que vous surveillez vient de baisser.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px; font-weight: bold;">Itinéraire : ${alerte.route}</p>
                <p style="margin: 4px 0 0 0; color: #4b5563;">Date de départ : ${departureDate}</p>
              </div>
              <table style="width: 100%; text-align: center; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0; text-decoration: line-through; color: #9ca3af; font-size: 16px;">Ancien prix</p>
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #6b7280;">${alerte.prixCible} €</p>
                  </td>
                  <td style="font-size: 24px; color: #1d4ed8;">➔</td>
                  <td>
                    <p style="margin: 0; color: #10b981; font-size: 16px; font-weight: bold;">Nouveau prix</p>
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">${freshPrice} €</p>
                  </td>
                </tr>
              </table>
              <div style="text-align: center;">
                <a href="http://localhost:5173/dashboard" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Voir le vol et réserver</a>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(
            `✉️ E-mail d'alerte envoyé avec succès à : ${alerte.email}`,
          );

          // 💾 5. Mettre à jour la base de données avec le nouveau prix plancher
          await db.execute(
            "UPDATE alerte SET prixCible = ? WHERE alerte_id = ?",
            [freshPrice, alerte.alerte_id],
          );
        } catch (mailError) {
          console.error(
            `❌ Échec de l'envoi de l'e-mail à ${alerte.email}:`,
            mailError,
          );
        }
      }
    }

    console.log("🏁 [ROBOT CRON] Fin de l'analyse nocturne.");
  } catch (error) {
    console.error(
      "❌ Erreur critique lors de la tâche automatisée Cron :",
      error,
    );
  }
});

module.exports = cron;
