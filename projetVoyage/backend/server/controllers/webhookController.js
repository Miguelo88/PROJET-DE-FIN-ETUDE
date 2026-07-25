const connectDB = require("../config/connexionBD");

exports.webhook = async (req, res) => {
    // 1. Affiche les données reçues de NotchPay dans votre console
    console.log("📥 [Webhook] Données reçues :", JSON.stringify(req.body, null, 2));

    const event = req.body;

    // 2. Vérification de l'événement de succès
    if (event && event.event === "payment.complete") {
        try {
            // Récupération de la référence (ex: RES-16-1784742848978)
            const trxref = event.data?.reference; 
            
            if (trxref && trxref.startsWith("RES-")) {
                const parts = trxref.split("-");
                const reservationId = parts[1]; // Extrait l'ID numérique (16)

                console.log(`🔍 [Webhook] Tentative de validation de la réservation ID: ${reservationId}`);

                // 3. Connexion et mise à jour dans MySQL
                const db = await connectDB();
                await db.execute(
                    "UPDATE reservations SET statut = ? WHERE id = ?",
                    ["Confirmé", reservationId]
                );

                console.log(`🎉 [Webhook] Réservation N°${reservationId} passée au statut 'Confirmé'.`);
            } else {
                console.log("⚠️ [Webhook] Format de référence non reconnu ou absent :", trxref);
            }
        } catch (error) {
            console.error("❌ [Webhook] Erreur SQL lors de la mise à jour :", error);
        }
    }

    // Toujours renvoyer un statut 200 à NotchPay pour valider la réception
    res.sendStatus(200);
};





// exports.webhook = async (req, res) => {

//     console.log(req.body);

//     res.sendStatus(200);
// };