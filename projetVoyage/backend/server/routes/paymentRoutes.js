const express=require("express");

const router=express.Router();

const {
createPayment
}=require("../controllers/paymentController");


router.post(
"/create",
createPayment
);

router.get("/webhook", (req,res)=>{

    console.log(req.query);

    res.send("Webhook GET reçu");

});

// Dans paymentRoutes.js
// router.get("/callback", (req, res) => {
//   const { status, trxref } = req.query;
  
//   console.log(`🧭 Redirection client reçue. Statut : ${status}, Référence : ${trxref}`);

//   if (status === "complete") {
//     // Redirige le navigateur de l'utilisateur vers la page finale du billet sur React
//     return res.redirect("http://localhost:5173/checkout?step=ticket&status=success");
//   } else {
//     // En cas d'échec ou d'annulation
//     return res.redirect("http://localhost:5173/checkout?step=payment&status=failed");
//   }
// });

router.get("/callback", (req, res) => {
  const { status, trxref } = req.query;
  
  console.log(`🧭 Redirection client reçue. Statut : ${status}, Référence : ${trxref}`);

  if (status === "complete" && trxref) {
    // trxref ressemble à "RES-42-1719999999999"
    // On extrait l'ID (42) situé entre les deux tirets
    const parts = trxref.split("-");
    const reservationId = parts[1]; // Récupère le deuxième élément (l'ID)

    // Redirige vers React en lui fournissant l'ID pour qu'il puisse charger le billet
    return res.redirect(`http://localhost:5173/checkout?step=ticket&status=success&id=${reservationId}`);
  } else {
    return res.redirect("http://localhost:5173/checkout?step=payment&status=failed");
  }
});


module.exports=router;