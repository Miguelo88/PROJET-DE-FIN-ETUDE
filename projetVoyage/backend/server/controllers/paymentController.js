const axios = require("axios");
const NOTCHPAY_API_URL =process.env.NOTCHPAY_API_URL;
const XAF_RATE = 6;
exports.createPayment = async(req,res)=>{
// const reference ="AeroPrix -"+Date.now();
// const reference =`RES-${reservationId}-${Date.now()}`;
try{

// const {
// amount,
// email,
// phone,
// description
// }=req.body;
const {

reservationId,

amount,

email,

phone,

description

} = req.body;
 // 2. Construire la référence unique après avoir récupéré 'reservationId'
    // Si reservationId n'est pas fourni par le front, on bascule sur un ID générique pour éviter le crash
    const safeId = reservationId || "TEMP";
    const reference = `RES-${safeId}-${Date.now()}`;

    // 3. Nettoyer et formater le numéro de téléphone pour Notch Pay (Ex: +2376xxxxxxxx)
    let cleanPhone = phone ? phone.replace(/[\s\-\(\)]/g, "") : "";
    if (cleanPhone.startsWith("6") && cleanPhone.length === 9) {
      cleanPhone = `+237${cleanPhone}`;
    } else if (cleanPhone && !cleanPhone.startsWith("+")) {
      cleanPhone = `+${cleanPhone}`;
    }


const response = await axios.post(
NOTCHPAY_API_URL,
{

amount: amount * XAF_RATE, 

currency:"XAF",
reference,

description:description,

customer:{

email:email,
phone:phone
},

// callback:"http://localhost:5173/checkout"
// callback:/api/payment/webhook
callback: "http://localhost:3000/api/payment/callback"

},

{

//     headers: {
//     Authorization: `Bearer ${process.env.NOTCHPAY_SECRET_KEY}`,
//     "Content-Type": "application/json"
// }
headers:{
Authorization:
process.env.NOTCHPAY_PUBLIC_KEY,

"Content-Type":"application/json"
}

});


res.json(response.data);


}catch(error){

console.log(
error.response?.data || error.message
);


res.status(500).json({
message:"Erreur création paiement"
});

}

};

// Dans votre paymentController.js pour la fonction webhook :
// exports.paymentWebhook = async (req, res) => {
//   // Notch Pay envoie un POST avec les données dans req.body
//   const event = req.body; 
  
//   if (event.event === "payment.complete") {
//     console.log("✅ Notch Pay confirme le paiement en arrière-plan. Validation BDD en cours...");
//     // Insérez ici votre code d'activation définitive du billet dans votre table MySQL
//   }
  
//   return res.status(200).json({ received: true });
// };
const connectDB = require("../config/connexionBD");

// exports.paymentWebhook = async (req, res) => {
//   const event = req.body; 
  
//   if (event.event === "payment.complete") {
//     console.log("✅ Notch Pay confirme le paiement. Mise à jour de la réservation...");
    
//     try {
//       const trxref = event.data.reference; // La référence unique (ex: RES-42-17199999)
//       const parts = trxref.split("-");
//       const reservationId = parts[1];

//       const db = await connectDB();
//       // On met à jour le statut en BDD
//       await db.execute(
//         "UPDATE reservations SET statut = ? WHERE id = ?",
//         ["Confirmé", reservationId]
//       );
//       console.log(`🎉 Réservation N°${reservationId} validée avec succès.`);
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour Webhook :", error);
//     }
//   }
  
//   return res.status(200).json({ received: true });
// };

exports.paymentWebhook = async (req, res) => {
  const event = req.body; 
  
  // 1. LOG CRITIQUE : Voir l'intégralité de ce que NotchPay envoie
  console.log("📥 [Webhook] Événement reçu de NotchPay :", JSON.stringify(event, null, 2));
  
  if (event.event === "payment.complete") {
    console.log("✅ [Webhook] Le statut de l'événement est bien 'payment.complete' !");
    
    try {
      // 2. LOG DES PROPRIÉTÉS : Vérifier où se cache la référence
      console.log("🔍 [Webhook] event.data :", event.data);
      console.log("🔍 [Webhook] Valeur de event.data.reference :", event.data?.reference);

      const trxref = event.data?.reference; 
      
      if (!trxref) {
        console.log("❌ [Webhook] Erreur : La référence est introuvable dans event.data");
        return res.status(400).json({ error: "No reference found" });
      }

      const parts = trxref.split("-");
      console.log("📋 [Webhook] Résultat du split :", parts);
      
      const reservationId = parts[1];
      console.log("🎯 [Webhook] ID de réservation extrait :", reservationId);

      const db = await connectDB();
      
      // Validation en BDD
      const [result] = await db.execute(
        "UPDATE reservations SET statut = ? WHERE id = ?",
        ["Confirmé", reservationId]
      );
      
      console.log(`🎉 [Webhook] Requête SQL exécutée. Lignes modifiées : ${result.affectedRows}`);
      
    } catch (error) {
      console.error("❌ [Webhook] Erreur interne pendant le traitement :", error);
    }
  } else {
    console.log(`⚠️ [Webhook] Événement ignoré (Type d'événement : ${event.event})`);
  }
  
  return res.status(200).json({ received: true });
};
