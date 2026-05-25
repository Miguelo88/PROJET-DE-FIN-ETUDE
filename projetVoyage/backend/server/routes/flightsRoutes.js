const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      tripType,
    } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        message: "Paramètres manquants (origin, destination, departureDate)",
      });
    }

    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "Clé AviationStack manquante dans le .env",
      });
    }

    const apiUrl = "http://api.aviationstack.com/v1/flights";

    const fetchFlights = async (depIata) => {
      const response = await axios.get(apiUrl, {
        params: {
          access_key: apiKey,
          dep_iata: depIata.toUpperCase(),
          limit: 100,
        },
      });

      return response.data.data || [];
    };

    const allDepartureFlights = await fetchFlights(origin);
    console.log("origin:", origin);
    console.log("destination:", destination);
    console.log("departureDate:", departureDate);
    console.log("nb vols reçus:", allDepartureFlights.length);
    console.log("exemple vol:", allDepartureFlights[0]);
    
    
    const departureFlights = allDepartureFlights.filter((flight) => {
      const matchDestination =
        flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
      const matchDate = flight.flight_date === departureDate;
      return matchDestination && matchDate;
    });

    let returnFlights = [];
    if (tripType === "round-trip" && returnDate) {
      const allReturnFlights = await fetchFlights(destination);

      returnFlights = allReturnFlights.filter((flight) => {
        const matchOrigin =
          flight.arrival?.iata?.toUpperCase() === origin.toUpperCase();
        const matchDate = flight.flight_date === returnDate;
        return matchOrigin && matchDate;
      });
    }

    return res.json({
      success: true,
      count: departureFlights.length,
      departureFlights,
      returnFlights,
      passengers: Number(passengers || 1),
    });
  } catch (error) {
    console.error(
      "Détails de l'erreur API :",
      error.response?.data || error.message
    );
    

    return res.status(500).json({
      message: "Erreur lors de la recherche des vols",
      error: error.response?.data?.error?.message || error.message,
    });
  }
  console.log("nb vols après filtrage:", departureFlights.length);
});

module.exports = router;

// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// router.get("/search", async (req, res) => {
//   try {
//     const {
//       origin,
//       destination,
//       departureDate,
//       returnDate,
//       passengers,
//       tripType,
//     } = req.query;

//     if (!origin || !destination || !departureDate) {
//       return res.status(400).json({ message: "Paramètres manquants" });
//     }

//     const apiKey = process.env.AVIATIONSTACK_API_KEY;
//     if (!apiKey) {
//       return res.status(500).json({ message: "Clé AviationStack manquante" });
//     }

//     const departureParams = {
//       access_key: apiKey,
//       dep_iata: origin,
//       arr_iata: destination,
//       flight_date: departureDate,
//       limit: 50,
//     };

//     const departureResponse = await axios.get(
//       "https://api.aviationstack.com/v1/flights",
//       { params: departureParams }
//     );

//     const departureFlights = departureResponse.data.data || [];

//     let returnFlights = [];
//     if (tripType === "round-trip" && returnDate) {
//       const returnParams = {
//         access_key: apiKey,
//         dep_iata: destination,
//         arr_iata: origin,
//         flight_date: returnDate,
//         limit: 50,
//       };

//       const returnResponse = await axios.get(
//         "https://api.aviationstack.com/v1/flights",
//         { params: returnParams }
//       );

//       returnFlights = returnResponse.data.data || [];
//     }

//     return res.json({
//       departureFlights,
//       returnFlights,
//       passengers: Number(passengers || 1),
//     });
//   } catch (error) {
//     console.error("Erreur recherche vols :", error.response?.data || error.message);
//     return res.status(500).json({ message: "Erreur lors de la recherche des vols" });
//   }
// });

// module.exports = router;