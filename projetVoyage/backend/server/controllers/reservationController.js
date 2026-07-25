const connectDB = require("../config/connexionBD");

// ==========================================
// Créer une réservation
// ==========================================
exports.createReservation = async (req, res) => {
    try {
        const db = await connectDB();

        const {
            user_id,
            vol_id,
            nombre_adultes,
            nombre_enfants,
            classe,
            prix_total
        } = req.body;

        const reservation_reference = "RES-" + Date.now();

        const sql = `
            INSERT INTO reservations
            (
                reservation_reference,
                user_id,
                vol_id,
                nombre_adultes,
                nombre_enfants,
                classe,
                prix_total
            )
            VALUES (?,?,?,?,?,?,?)
        `;

        const [result] = await db.execute(sql, [
            reservation_reference,
            user_id,
            vol_id,
            nombre_adultes,
            nombre_enfants,
            classe,
            prix_total
        ]);

        res.status(201).json({
            success: true,
            reservationId: result.insertId,
            reservation_reference
        });

    } catch (error) {

        console.error("Erreur création réservation :", error);

        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la réservation"
        });

    }
};

// ==========================================
// Obtenir une réservation par son ID
// ==========================================
exports.getReservationById = async (req, res) => {

    try {

        const db = await connectDB();

        const [rows] = await db.execute(

            "SELECT * FROM reservations WHERE id=?",

            [req.params.id]

        );

        if (rows.length === 0) {

            return res.status(404).json({
                message: "Réservation introuvable"
            });

        }

        res.json(rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }

};

// ==========================================
// Toutes les réservations d'un utilisateur
// ==========================================
exports.getUserReservations = async (req, res) => {

    try {

        const db = await connectDB();

        const [rows] = await db.execute(

            "SELECT * FROM reservations WHERE user_id=? ORDER BY id DESC",

            [req.params.userId]

        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }

};

// ==========================================
// Modifier le statut d'une réservation
// ==========================================
exports.updateReservationStatus = async (req, res) => {

    try {

        const db = await connectDB();

        const { statut } = req.body;

        await db.execute(

            "UPDATE reservations SET statut=? WHERE id=?",

            [statut, req.params.id]

        );

        res.json({

            success: true,

            message: "Réservation mise à jour avec succès"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Erreur lors de la mise à jour"

        });

    }

};








// const connectDB = require("../config/connexionBD");

// // CREATION DE RESERVATION
// exports.createReservation = (req, res) => {
//     const db = await connectDB();
//     const {
//         user_id,
//         vol_id,
//         nombre_adultes,
//         nombre_enfants,
//         classe,
//         prix_total
//     } = req.body;

//     const reservation_reference =
//         "RES-" + Date.now();

//     const sql = `
//         INSERT INTO reservations
//         (
//             reservation_reference,
//             user_id,
//             vol_id,
//             nombre_adultes,
//             nombre_enfants,
//             classe,
//             prix_total
//         )
//         VALUES (?,?,?,?,?,?,?)
//     `;

//     db.query(
//         sql,
//         [
//             reservation_reference,
//             user_id,
//             vol_id,
//             nombre_adultes,
//             nombre_enfants,
//             classe,
//             prix_total
//         ],
//         (err, result) => {

//             if (err) {
//                 console.log(err);
//                 return res.status(500).json(err);
//             }

//             res.status(201).json({

//                 reservationId: result.insertId,

//                 reservation_reference

//             });

//         }
//     );

// };

// // Obtenir une réservation

// exports.getReservationById = (req,res)=>{

//     db.query(

//         "SELECT * FROM reservations WHERE id=?",

//         [req.params.id],

//         (err,result)=>{

//             if(err)
//                 return res.status(500).json(err);

//             res.json(result[0]);

//         }

//     );

// };

// // Réservations d'un utilisateur

// exports.getUserReservations = (req,res)=>{

//     db.query(

//         "SELECT * FROM reservations WHERE user_id=? ORDER BY id DESC",

//         [req.params.userId],

//         (err,result)=>{

//             if(err)
//                 return res.status(500).json(err);

//             res.json(result);

//         }

//     );

// };

// // Mise à jour du statut

// exports.updateReservationStatus = (req,res)=>{

//     const { statut } = req.body;

//     db.query(

//         "UPDATE reservations SET statut=? WHERE id=?",

//         [statut,req.params.id],

//         (err)=>{

//             if(err)
//                 return res.status(500).json(err);

//             res.json({

//                 message:"Réservation mise à jour"

//             });

//         }

//     );

// };