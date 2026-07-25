const express = require("express");
const router = express.Router();

const {
    createReservation,
    getReservationById,
    getUserReservations,
    updateReservationStatus
} = require("../controllers/reservationController");

router.post("/", createReservation);

router.get("/:id", getReservationById);

router.get("/user/:userId", getUserReservations);

router.put("/:id/status", updateReservationStatus);

module.exports = router;