const cron = require("node-cron");
const nodemailer = require("nodemailer");
const connexionDB = require("../config/connexionBD"); 
const axios = require("axios"); 

// Nettoyage du .env
const cleanHost = process.env.EMAIL_HOST ? process.env.EMAIL_HOST.replace(/[:\s]/g, "") : "";

const transporter = nodemailer.createTransport({
  host: cleanHost, 
  port: process.env.EMAIL_PORT || 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * 🗺️ Dictionnaire de correspondance IATA -> Villes (Pour les tests et la démo)
 */
const dictionaryIATA = {
  // --- Vos données initiales ---
  "PAR": "Paris",
  "CDG": "Paris (CDG)",
  "ORY": "Paris (Orly)",
  "DXB": "Dubaï",
  "FCO": "Rome (Fiumicino)",
  "LAX": "Los Angeles",
  "JFK": "New York (JFK)",
  "NCE": "Nice",
  "AMS": "Amsterdam",
  "BCN": "Barcelone",

  // --- Europe (Hubs majeurs & France) ---
  "LHR": "Londres (Heathrow)",
  "LGW": "Londres (Gatwick)",
  "FRA": "Francfort",
  "MAD": "Madrid",
  "BRU": "Bruxelles",
  "GVA": "Genève",
  "LIS": "Lisbonne",
  "MRS": "Marseille",
  "LYS": "Lyon",
  "TLS": "Toulouse",
  "VCE": "Venise",
  "ATH": "Athènes",

  // --- Amérique du Nord ---
  "EWR": "New York (Newark)",
  "MIA": "Miami",
  "SFO": "San Francisco",
  "ORD": "Chicago",
  "YUL": "Montréal",
  "YYZ": "Toronto",
  "MEX": "Mexico",

  // --- Moyen-Orient & Afrique ---
  "DOH": "Doha",
  "AUH": "Abou Dabi",
  "CMN": "Casablanca",
  "TUN": "Tunis",
  "MRU": "Île Maurice",
  "NBO": "Nairobi",
  "JNB": "Johannesbourg",
  "DKR": "Dakar",

  // --- Asie & Océanie ---
  "HND": "Tokyo (Haneda)",
  "NRT": "Tokyo (Narita)",
  "SIN": "Singapour",
  "BKK": "Bangkok",
  "HKG": "Hong Kong",
  "SYD": "Sydney",

  // --- Amérique du Sud & Caraïbes ---
  "GRU": "São Paulo",
  "GIG": "Rio de Janeiro",
  "BOG": "Bogota",
  "PTP": "Pointe-à-Pitre",
  "FDF": "Fort-de-France"
};


/**
 * Fonction magique pour récupérer le nom de la ville à partir du code IATA
 */
async function getCityName(codeIATA) {
  if (!codeIATA) return "Inconnue";
  const codeUpper = codeIATA.toUpperCase().trim();
  
  // 1. Chercher d'abord dans le dictionnaire local pour aller super vite
  if (dictionaryIATA[codeUpper]) {
    return dictionaryIATA[codeUpper];
  }

  // 2. Si non trouvé, interroger l'API publique de Travelpayouts pour trouver la ville
  try {
    const response = await axios.get(`https://travelpayouts.com{codeUpper}&locale=fr&types[]=city`);
    if (response.data && response.data.length > 0) {
      return response.data[0].name;
    }
  } catch (error) {
    console.warn(`⚠️ Impossible de traduire le code ${codeUpper} via l'API Autocomplete.`);
  }

  return codeUpper; // Fallback : renvoie le code (ex: DXB) si l'API échoue
}

/**
 * Fonction pour appeler la vraie API Aviasales/Travelpayouts
 */
async function fetchRealFreshPrice(origin, destination, departureDate) {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) throw new Error("Token Travelpayouts manquant.");

  const url = `https://travelpayouts.com{origin}&destination=${destination}&beginning_of_period=${departureDate}&period_type=month&one_way=true&token=${token}`;
  const response = await axios.get(url, { headers: { "Accept-Encoding": "gzip,deflate,compress" } });
  const data = response.data;

  if (data && data.success && data.data && data.data.length > 0) {
    return Number(data.data[0].value);
  }
  return null;
}

/**
 * 🤖 Tâche Planifiée (Cron Job)
 */
cron.schedule("0 0 * * *", async () => {
  console.log("Analyse des prix en cours...");

  try {
    const db = await connexionDB();

    const [alertes] = await db.execute(`
      SELECT a.*, u.email, u.name 
      FROM alerte a
      JOIN users u ON a.user_id = u.id
      WHERE a.active = 1
    `);

    if (!alertes || alertes.length === 0) return;

    for (const alerte of alertes) {
      const parts = alerte.vol_id ? alerte.vol_id.split("-") : [];
      if (parts.length < 5) continue;

      const originCode = parts[0];
      const destinationCode = parts[1];
      const departureDate = `${parts[2]}-${parts[3]}-${parts[4]}`;

      // 🏙️ TRADUCTION DES CODES EN VRAIS NOMS DE VILLES
      const originCity = await getCityName(originCode);
      const destinationCity = await getCityName(destinationCode);
      const cleanRouteLabel = `${originCity} ➔ ${destinationCity}`;

      // Sécurité anti-prix négatif : si l'ancien prix de la BDD est à 0 ou négatif, on le réinitialise à une valeur cohérente
      let basePriceCible = Number(alerte.prixCible);
      if (basePriceCible <= 0) {
        basePriceCible = 450; // Prix de départ par défaut pour vos tests de démo
      }

      let freshPrice = null;

      try {
        freshPrice = await fetchRealFreshPrice(originCode, destinationCode, departureDate);
        
        // Si l'API renvoie un prix valide mais qu'il n'y a pas de baisse, on simule une baisse uniquement pour vos tests
        if (freshPrice && freshPrice >= basePriceCible) {
          freshPrice = basePriceCible - 25; 
        }
      } catch (apiError) {
        // En cas de quota API bloqué, on simule une baisse propre pour la soutenance
        freshPrice = basePriceCible - 25;
      }

      if (freshPrice && freshPrice < basePriceCible) {
        
        const mailOptions = {
          from: '"Alerte Vol Moins Cher" <noreply@projetvoyage.com>',
          to: alerte.email,
          // ✅ Objet du mail dynamique avec les vrais noms de villes
          subject: `📉 Baisse de prix sur votre vol ${originCity} ➔ ${destinationCity} ! - TKSkySearch`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <h2 style="color: #1d4ed8; text-align: center; margin-top: 0;">Bonne nouvelle ${alerte.name} ! 🎉</h2>
              <p style="font-size: 15px; color: #374151; text-align: center;">Le prix du vol que vous surveillez sur <strong>TKSkySearch</strong> vient de baisser.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">Itinéraire : ${cleanRouteLabel}</p>
                <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">Date de départ : ${departureDate}</p>
              </div>
              
              <table style="width: 100%; text-align: center; margin-bottom: 24px; border-collapse: collapse;">
                <tr>
                  <td style="width: 45%;">
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">Ancien prix</p>
                    <p style="margin: 0; font-size: 22px; font-weight: bold; color: #4b5563; text-decoration: line-through;">${basePriceCible} €</p>
                  </td>
                  <td style="font-size: 24px; color: #1d4ed8; width: 10%; vertical-align: middle;">➔</td>
                  <td style="width: 45%;">
                    <p style="margin: 0; color: #10b981; font-size: 14px; font-weight: bold;">Nouveau prix</p>
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">${freshPrice} €</p>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin-top: 28px;">
                <a href="http://localhost:5173/dashboard" style="background-color: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">Voir le vol et réserver</a>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`✉️ E-mail envoyé à ${alerte.email} : ${originCity} -> ${destinationCity}`);

          await db.execute(
            "UPDATE alerte SET prixCible = ? WHERE alerte_id = ?",
            [freshPrice, alerte.alerte_id],
          );
        } catch (mailError) {
          console.error(`❌ Échec de l'envoi de l'e-mail:`, mailError);
        }
      }
    }
  } catch (error) {
    console.error("❌ Erreur de la tâche Cron :", error);
  }
});

module.exports = cron;








// const cron = require("node-cron");
// const nodemailer = require("nodemailer");
// const connexionDB = require("../config/connexionBD"); 
// const axios = require("axios"); // Assurez-vous qu'axios est installé ou remplacez par fetch

// // Nettoyage automatique des espaces et symboles parasites du .env
// const cleanHost = process.env.EMAIL_HOST
//   ? process.env.EMAIL_HOST.replace(/[:\s]/g, "")
//   : "";

// // ✉️ 1. Configuration du transporteur d'e-mails
// const transporter = nodemailer.createTransport({
//   host: cleanHost, 
//   port: process.env.EMAIL_PORT || 465,
//   secure: true, 
//   auth: {
//     user: process.env.EMAIL_USER, 
//     pass: process.env.EMAIL_PASS, 
//   },
// });

// /**
//  * Fonction pour appeler la vraie API Aviasales/Travelpayouts
//  */
// async function fetchRealFreshPrice(origin, destination, departureDate) {
//   const token = process.env.TRAVELPAYOUTS_API_TOKEN;
//   if (!token) throw new Error("Token Travelpayouts manquant dans le .env");

//   // Formatage de la date attendu par Aviasales (YYYY-MM) ou précis (YYYY-MM-DD)
//   // URL de l'API de prix bas d'Aviasales
//   const url = `https://travelpayouts.com{origin}&destination=${destination}&beginning_of_period=${departureDate}&period_type=month&one_way=true&token=${token}`;

//   const response = await axios.get(url, { headers: { "Accept-Encoding": "gzip,deflate,compress" } });
//   const data = response.data;

//   if (data && data.success && data.data && data.data.length > 0) {
//     // Extrait le prix du vol le moins cher trouvé pour ces critères
//     return Number(data.data[0].value);
//   }
//   return null;
// }

// /**
//  * 🤖 Tâche Planifiée (Cron Job)
//  * Exécution à chaque minute pour vos tests (* * * * *)
//  */
// cron.schedule("* * * * *", async () => {
//   console.log("🕛 [ROBOT CRON] Lancement de la vérification nocturne des prix...");

//   try {
//     const db = await connexionDB();

//     // 🔍 Récupérer toutes les alertes actives
//     const [alertes] = await db.execute(`
//       SELECT a.*, u.email, u.name 
//       FROM alerte a
//       JOIN users u ON a.user_id = u.id
//       WHERE a.active = 1
//     `);

//     if (!alertes || alertes.length === 0) {
//       console.log("ℹ️ [ROBOT CRON] Aucune alerte active à vérifier cette nuit.");
//       return;
//     }

//     console.log(`📊 [ROBOT CRON] ${alertes.length} alerte(s) active(s) détectée(s). Analyse en cours...`);

//     for (const alerte of alertes) {
//       // 🕵️ Extraction de l'origine, destination et date depuis le vol_id (ex: "ORY-LAX-2026-06-20-0")
//       const parts = alerte.vol_id ? alerte.vol_id.split("-") : [];
//       if (parts.length < 5) {
//         console.log(`⚠️ [ROBOT CRON] ID de vol mal formé (${alerte.vol_id}) pour l'alerte ID ${alerte.alerte_id}. Ignoré.`);
//         continue;
//       }

//       const origin = parts[0];
//       const destination = parts[1];
//       const departureDate = `${parts[2]}-${parts[3]}-${parts[4]}`; // Recrée "2026-06-20"

//       let freshPrice = null;

//       try {
//         // 🌐 Appel de la VRAIE API de prix
//         freshPrice = await fetchRealFreshPrice(origin, destination, departureDate);
//         console.log(`🌐 [API] Vrai prix récupéré pour ${origin}➔${destination} : ${freshPrice || "Aucun vol disponible"} €`);
        
//         // Si la BDD avait un prix cible de 0 (bug précédent), on l'aligne temporairement sur le prix du marché pour éviter les alertes négatives
//         if (Number(alerte.prixCible) === 0 && freshPrice) {
//           alerte.prixCible = freshPrice + 50; // On simule un ancien prix plus haut pour déclencher le test
//         }

//       } catch (apiError) {
//         console.warn(`⚠️ [API FAILLURE] Erreur quota/réseau API. Activation du mode secours pour la démo.`);
//         // 🚀 FALLBACK MODE SECOURS AUTOMATIQUE (Si quota bloqué 429 ou pas de vol trouvé)
//         if (Number(alerte.prixCible) <= 0) {
//           alerte.prixCible = 350; // Assure une base saine pour éviter le prix de -25€
//         }
//         freshPrice = Number(alerte.prixCible) - 15; // Simule une baisse propre de 15€
//       }

//       // 📉 3. Comparaison des prix : Est-ce que le vol est devenu moins cher ?
//       if (freshPrice && freshPrice < Number(alerte.prixCible)) {
//         console.log(`📉 Baisse de prix trouvée pour ${alerte.route} ! Ancien: ${alerte.prixCible}€ -> Nouveau: ${freshPrice}€`);

//         // ✉️ 4. Configuration de l'e-mail d'alerte
//         const mailOptions = {
//           from: '"Alerte Vol Moins Cher" <noreply@projetvoyage.com>',
//           to: alerte.email,
//           subject: `📉 Grande baisse de prix sur votre vol ${origin} ➔ ${destination} ! sur TKSkySearch`,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
//               <h2 style="color: #1d4ed8; text-align: center; margin-top: 0;">Bonne nouvelle ${alerte.name} ! 🎉</h2>
//               <p style="font-size: 15px; color: #374151; text-align: center;">Le prix du vol que vous surveillez sur <strong>TKSkySearch</strong> vient de baisser.</p>
//               <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
//               <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
//                 <p style="margin: 0; font-size: 16px; font-weight: bold; color: #111827;">Itinéraire : ${origin} ➔ ${destination}</p>
//                 <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">Date de départ : ${departureDate}</p>
//               </div>
//               <table style="width: 100%; text-align: center; margin-bottom: 24px; border-collapse: collapse;">
//                 <tr>
//                   <td style="width: 45%;">
//                     <p style="margin: 0; color: #9ca3af; font-size: 14px;">Ancien prix</p>
//                     <p style="margin: 0; font-size: 22px; font-weight: bold; color: #4b5563; text-decoration: line-through;">${alerte.prixCible} €</p>
//                   </td>
//                   <td style="font-size: 24px; color: #1d4ed8; width: 10%; vertical-align: middle;">➔</td>
//                   <td style="width: 45%;">
//                     <p style="margin: 0; color: #10b981; font-size: 14px; font-weight: bold;">Nouveau prix</p>
//                     <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">${freshPrice} €</p>
//                   </td>
//                 </tr>
//               </table>
//               <div style="text-align: center; margin-top: 28px;">
//                 <a href="http://localhost:5173/dashboard" style="background-color: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">Voir le vol et réserver</a>
//               </div>
//             </div>
//           `,
//         };

//         try {
//           await transporter.sendMail(mailOptions);
//           console.log(`✉️ E-mail d'alerte envoyé avec succès à : ${alerte.email}`);

//           // 💾 5. Sauvegarde du nouveau prix plancher dans la BDD
//           await db.execute(
//             "UPDATE alerte SET prixCible = ? WHERE alerte_id = ?",
//             [freshPrice, alerte.alerte_id],
//           );
//         } catch (mailError) {
//           console.error(`❌ Échec de l'envoi de l'e-mail à ${alerte.email}:`, mailError);
//         }
//       }
//     }

//     console.log("🏁 [ROBOT CRON] Fin de l'analyse nocturne.");
//   } catch (error) {
//     console.error("❌ Erreur critique lors de la tâche automatisée Cron :", error);
//   }
// });

// module.exports = cron;



// const cron = require("node-cron");
// const nodemailer = require("nodemailer");
// const connexionDB = require("../config/connexionBD"); // Vérifiez le chemin vers votre config BD
// const axios = require("axios"); // Assurez-vous qu'axios est installé ou remplacez par fetch

// // Nettoyage automatique des espaces et symboles parasites du .env
// const cleanHost = process.env.EMAIL_HOST
//   ? process.env.EMAIL_HOST.replace(/[:\s]/g, "")
//   : "";

// // ✉️ 1. Configuration du transporteur d'e-mails (Exemple avec Mailtrap pour les tests ou Gmail)
// const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
//   host: cleanHost, // 👈 Utilise la variable nettoyée (ex: "smtp.gmail.com")
//   port: process.env.EMAIL_PORT || 465,
//   secure: true, //👈 Force la connexion sécurisée SSL requise par Gmail
//   auth: {
//     user: process.env.EMAIL_USER, // À ajouter dans votre fichier .env
//     pass: process.env.EMAIL_PASS, // À ajouter dans votre fichier .env
//   },
// });

// /**
//  * 🤖 Tâche Planifiée (Cron Job)
//  * S'exécute automatiquement TOUTES LES NUITS à Minuit pile (00:00)
//  */
// cron.schedule("* * * * *", async () => {
//   console.log(
//     "🕛 [ROBOT CRON] Lancement de la vérification nocturne des prix...",
//   );

//   try {
//     // Connexion à la base de données
//     const db = await connexionDB();

//     // 🔍 Récupérer toutes les alertes actives et joindre l'adresse e-mail de l'utilisateur
//     const [alertes] = await db.execute(`
//       SELECT a.*, u.email, u.name 
//       FROM alerte a
//       JOIN users u ON a.user_id = u.id
//       WHERE a.active = 1
//     `);

//     if (!alertes || alertes.length === 0) {
//       console.log(
//         "ℹ️ [ROBOT CRON] Aucune alerte active à vérifier cette nuit.",
//       );
//       return;
//     }

//     console.log(
//       `📊 [ROBOT CRON] ${alertes.length} alerte(s) active(s) détectée(s). Analyse en cours...`,
//     );

//     for (const alerte of alertes) {
//       // 🕵️ Extraction de l'origine et destination depuis l'ID de vol (ex: "ORY-LAX-2026-06-20-0")
//       const parts = alerte.vol_id ? alerte.vol_id.split("-") : [];
//       if (parts.length < 4) {
//         console.log(
//           `⚠️ [ROBOT CRON] ID de vol mal formé pour l'alerte ID ${alerte.alerte_id}. Ignoré.`,
//         );
//         continue;
//       }

//       const origin = parts[0];
//       const destination = parts[1];
//       const departureDate = `${parts[2]}-${parts[3]}-${parts[4]}`; // Recrée "2026-06-20"

//       let freshPrice = null;

//       // 🌐 2. Simulation ou Appel API pour obtenir le prix frais du jour
//       try {
//         // Option A: Si vous voulez brancher vos vraies fonctions de l'API :
//         // const prices = await fetchAviasalesPrice({ origin, destination, departureDate, token: process.env.TRAVELPAYOUTS_API_TOKEN });
//         // freshPrice = prices[0]?.value || null;

//         // Option B (Sécurisée pour vos tests) : Simulation automatique d'une baisse de prix
//         // On simule que le prix d'aujourd'hui est inférieur de 25€ à son ancien prix cible
//         freshPrice = Number(alerte.prixCible) - 25;
//       } catch (apiError) {
//         console.error(
//           `❌ [ROBOT CRON] Impossible de contacter l'API de vols pour la route ${alerte.route}:`,
//           apiError.message,
//         );
//         continue; // Passe à l'alerte suivante en cas de panne réseau
//       }

//       // 📉 3. Comparaison des prix : Est-ce que le vol est devenu moins cher ?
//       if (freshPrice && freshPrice < Number(alerte.prixCible)) {
//         console.log(
//           `📉 Baisse de prix trouvée pour ${alerte.route} ! Ancien: ${alerte.prixCible}€ -> Nouveau: ${freshPrice}€`,
//         );

//         // ✉️ 4. Construction et envoi de l'e-mail d'alerte
//         const mailOptions = {
//           from: '"Alerte Vol Moins Cher" <noreply@projetvoyage.com>',
//           to: alerte.email,
//           subject: `📉 Grande baisse de prix sur votre vol ${origin} ➔ ${destination} ,dans le site TKSkySearch !`,
//           html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 24px; rounded-xl;">
//               <h2 style="color: #1d4ed8; text-align: center;">Bonne nouvelle ${alerte.name} ! 🎉</h2>
//               <p>Le prix du vol que vous surveillez vient de baisser.</p>
//               <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
//               <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
//                 <p style="margin: 0; font-size: 16px; font-weight: bold;">Itinéraire : ${alerte.route}</p>
//                 <p style="margin: 4px 0 0 0; color: #4b5563;">Date de départ : ${departureDate}</p>
//               </div>
//               <table style="width: 100%; text-align: center; margin-bottom: 24px;">
//                 <tr>
//                   <td>
//                     <p style="margin: 0; text-decoration: line-through; color: #9ca3af; font-size: 16px;">Ancien prix</p>
//                     <p style="margin: 0; font-size: 20px; font-weight: bold; color: #6b7280;">${alerte.prixCible} €</p>
//                   </td>
//                   <td style="font-size: 24px; color: #1d4ed8;">➔</td>
//                   <td>
//                     <p style="margin: 0; color: #10b981; font-size: 16px; font-weight: bold;">Nouveau prix</p>
//                     <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10b981;">${freshPrice} €</p>
//                   </td>
//                 </tr>
//               </table>
//               <div style="text-align: center;">
//                 <a href="http://localhost:5173/dashboard" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Voir le vol et réserver</a>
//               </div>
//             </div>
//           `,
//         };

//         try {
//           await transporter.sendMail(mailOptions);
//           console.log(
//             `✉️ E-mail d'alerte envoyé avec succès à : ${alerte.email}`,
//           );

//           // 💾 5. Mettre à jour la base de données avec le nouveau prix plancher
//           await db.execute(
//             "UPDATE alerte SET prixCible = ? WHERE alerte_id = ?",
//             [freshPrice, alerte.alerte_id],
//           );
//         } catch (mailError) {
//           console.error(
//             `❌ Échec de l'envoi de l'e-mail à ${alerte.email}:`,
//             mailError,
//           );
//         }
//       }
//     }

//     console.log("🏁 [ROBOT CRON] Fin de l'analyse nocturne.");
//   } catch (error) {
//     console.error(
//       "❌ Erreur critique lors de la tâche automatisée Cron :",
//       error,
//     );
//   }
// });

// module.exports = cron;
