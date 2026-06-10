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

    // Modifiez temporairement votre filtre pour qu'il soit moins strict pendant que vous créez votre design. Si l'API ne trouve pas la date exacte ou la destination exacte, vous forcez l'affichage des vols reçus pour pouvoir tester votre interface React.

    // const departureFlights = allDepartureFlights.filter((flight) => {
    //   const matchDestination =
    //     flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
    //   const matchDate = flight.flight_date === departureDate;
    //   return matchDestination && matchDate;
    // });
    // Filtrage intelligent pour le développement
    let departureFlights = allDepartureFlights.filter((flight) => {
      return flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
    });

    // 💡 Astuce de secours : Si aucun vol ne va à cette destination spécifique dans le lot des 100,
    // on prend les vols disponibles et on change artificiellement leur destination pour vos tests React.
    if (departureFlights.length === 0 && allDepartureFlights.length > 0) {
      console.log(
        "⚠️ Aucun vol trouvé pour cette destination exacte. Mode démo activé.",
      );
      departureFlights = allDepartureFlights.slice(0, 10).map((flight) => ({
        ...flight,
        flight_date: departureDate, // On force la date recherchée
        arrival: {
          ...flight.arrival,
          iata: destination.toUpperCase(), // On force la destination recherchée
          airport: `${destination.toUpperCase()} International Airport`,
        },
      }));
    }

    let returnFlights = [];
    if (tripType === "round-trip" && returnDate) {
      const allReturnFlights = await fetchFlights(destination);

      returnFlights = allReturnFlights.filter((flight) => {
        const matchOrigin =
          flight.arrival?.iata?.toUpperCase() === origin.toUpperCase();
        const matchDate = flight.flight_date === returnDate;
        return matchOrigin && matchDate;
      });
      console.log("nb vols après filtrage:", departureFlights.length);
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
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Erreur lors de la recherche des vols",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

// Nouvelle route pour récupérer UN vol spécifique via son ID

router.get("/:id", async (req, res) => {
  try {
    const flightId = req.params.id;

    // ✅ Parse l'ID pour extraire les informations
    // Ton frontend envoie: /flight/CDG-DLA-2026-05-30-1234?origin=CDG&destination=DLA&date=2026-05-30
    // Tu peux encoder l'ID différemment selon comment tu le génères dans FlightCard

    // Exemple: si l'ID est de la forme "CDG-DLA-2026-05-30-0" (index dans le tableau)
    // Tu peux le parser ainsi :
    const parts = flightId.split("-");

    // Si tu stockes origin, destination, date et index dans l'ID
    if (parts.length >= 4) {
      const origin = parts[0];
      const destination = parts[1];
      const date = parts.slice(2, 4).join("-"); // reconstitue la date

      // Appel réel à AviationStack
      const response = await axios.get(AVIATION_STACK_API_URL, {
        params: {
          access_key: AVIATION_STACK_API_KEY,
          dep_iata: origin,
          arr_iata: destination,
          flight_date: date,
        },
      });

      const flights = response.data.results || [];

      // Trouve le vol à l'index correspondant (dernier élément de parts)
      const index = parseInt(parts[parts.length - 1]);

      if (!flights[index]) {
        return res.status(404).json({
          error: "Vol non trouvé",
          message: `Aucun vol à l'index ${index} pour cette recherche`,
        });
      }

      const aviationFlight = flights[index];

      // ✅ MAPPER LES DONNÉES D'AVIATIONSTACK → FORMAT FRONTEND
      const flight = {
        id: flightId && flightId !== 0 ? flightId : `flight-${Date.now()}`, // fallback ID
        airline: aviationFlight.airline?.name || "Compagnie inconnue",
        flightNumber:
          aviationFlight.flight?.number || aviationFlight.flight?.iata || "N/A",
        origin: aviationFlight.departure?.iata || "XYZ" || origin,
        originCity: aviationFlight.departure?.city || "Ville inconnue",
        originName:
          aviationFlight.departure?.airport ||
          aviationFlight.departure?.iata ||
          origin,
        destination: aviationFlight.arrival?.iata || "XYZ" || destination,
        destinationCity: aviationFlight.arrival?.city || "Ville inconnue",
        destinationName:
          aviationFlight.arrival?.airport ||
          aviationFlight.arrival?.iata ||
          destination,
        departureTime:
          aviationFlight.departure?.scheduled?.split("T")[1]?.substring(0, 5) ||
          "00:00",
        arrivalTime:
          aviationFlight.arrival?.scheduled?.split("T")[1]?.substring(0, 5) ||
          "00:00",
        duration: aviationFlight.flight?.duration?.text || "Calculer",
        stops, // AviationStack ne renvoie pas directement le nombre d'escales
        price, // Tu dois avoir ce champ dans ton frontend ou le récupérer ailleurs
        aircraft: aviationFlight.aircraft?.model || "Appareil inconnu",
        cabinClass: "Économique", // à définir selon ton système
        availableSeats: 50, // à définir selon ton système
        date:
          date ||
          aviationFlight.flight_date ||
          new Date().toISOString().split("T")[0],
        flight_date:
          date ||
          aviationFlight.flight_date ||
          new Date().toISOString().split("T")[0],
        flight_status: aviationFlight.flight_status || "scheduled",
      };

      return res.json(flight);
    }

    // ❌ Si l'ID n'est pas dans le bon format
    return res.status(400).json({
      error: "ID de vol invalide",
      message:
        "Format d'ID attendu: ORIGIN-DESTINATION-DATE-INDEX (ex: CDG-DLA-2026-05-30-0)",
    });
  } catch (error) {
    console.error(
      "Erreur récupération du vol:",
      error.response?.data || error.message,
    );

    if (error.response?.status === 401) {
      return res.status(500).json({
        error: "Erreur API AviationStack",
        message: "Clé API invalide ou manquante",
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: "Vol non trouvé",
        message: "Aucun vol trouvé pour ces critères",
      });
    }

    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message,
    });
  }
});

module.exports = router;
