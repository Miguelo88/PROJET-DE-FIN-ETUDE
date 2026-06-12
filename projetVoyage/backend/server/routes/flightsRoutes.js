const express = require("express");
const axios = require("axios");
const router = express.Router();

const AVIATIONSTACK_URL = "http://api.aviationstack.com/v1/flights";
const TRAVELPAYOUTS_GRAPHQL_URL =
  "https://api.travelpayouts.com/graphql/v1/query";

const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMinutesFromDate = (value) => {
  const date = toDate(value);

  if (!date) {
    return null;
  }

  return date.getHours() * 60 + date.getMinutes();
};

const fetchAviationFlights = async ({
  origin,
  destination,
  departureDate,
  apiKey,
}) => {
  const response = await axios.get(AVIATIONSTACK_URL, {
    params: {
      access_key: apiKey,
      dep_iata: origin.toUpperCase(),
      arr_iata: destination.toUpperCase(),
      // flight_date: departureDate,
      limit: 10, // Réduit à 10 pour le plan gratuit
    },
  });

  const allFlights = response.data.data || [];

  // 1. On essaie de filtrer strictement par la date demandée
  const filteredFlights = allFlights.filter(
    (flight) => flight.flight_date === departureDate,
  );

  // 2. FILET DE SÉCURITÉ : Si aucun vol ne correspond à cette date future,
  // on retourne tous les vols disponibles pour que le site ne soit pas vide
  if (filteredFlights.length === 0) {
    return allFlights;
  }

  // // FILTRAGE LOCAL ET GRATUIT : On filtre par date nous-mêmes dans le code
  // const filteredFlights = allFlights.filter(flight => {
  //   return flight.flight_date === departureDate;
  // });

  // Si le filtre local est trop strict et ne retourne rien durant tes tests,
  // tu peux temporairement retourner "allFlights" pour voir si des données arrivent.
  return filteredFlights;
};

const fetchAviasalesPrice = async ({
  origin,
  destination,
  departureDate,
  token,
}) => {
  const departMonth = `${departureDate.slice(0, 7)}-01`;

  const query = `
    {
      prices_one_way(
        params: {
          origin: "${origin.toUpperCase()}"
          destination: "${destination.toUpperCase()}"
          depart_months: "${departMonth}"
          no_lowcost: false
        }
        paging: { limit: 10, offset: 0 }
        sorting: VALUE_ASC
      ) {
        departure_at
        value
        trip_duration
        ticket_link
      }
    }
  `;

  const response = await axios.post(
    TRAVELPAYOUTS_GRAPHQL_URL,
    { query },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": token,
      },
    },
  );

  return response.data?.data?.prices_one_way || [];
};

const selectBestPriceForFlight = (priceList, flight) => {
  if (!Array.isArray(priceList) || priceList.length === 0) {
    return null;
  }

  const flightDeparture = flight.departure?.scheduled || null;
  const flightDepartureDate = flightDeparture
    ? flightDeparture.slice(0, 10)
    : null;
  const flightDepartureMinutes = getMinutesFromDate(flightDeparture);

  const sortedPrices = [...priceList].sort(
    (left, right) => left.value - right.value,
  );

  if (!flightDepartureDate || flightDepartureMinutes === null) {
    return sortedPrices[0] || null;
  }

  const sameDayPrices = sortedPrices.filter((price) => {
    const departureAt = price.departure_at || "";
    return departureAt.slice(0, 10) === flightDepartureDate;
  });

  const candidates = sameDayPrices.length > 0 ? sameDayPrices : sortedPrices;

  return candidates.reduce((best, current) => {
    if (!best) {
      return current;
    }

    const bestMinutes = getMinutesFromDate(best.departure_at);
    const currentMinutes = getMinutesFromDate(current.departure_at);

    if (bestMinutes === null && currentMinutes === null) {
      return best.value <= current.value ? best : current;
    }

    if (bestMinutes === null) {
      return current;
    }

    if (currentMinutes === null) {
      return best;
    }

    const bestDistance = Math.abs(bestMinutes - flightDepartureMinutes);
    const currentDistance = Math.abs(currentMinutes - flightDepartureMinutes);

    if (currentDistance < bestDistance) {
      return current;
    }

    if (currentDistance === bestDistance && current.value < best.value) {
      return current;
    }

    return best;
  }, null);
};

const formatDuration = (departureScheduled, arrivalScheduled) => {
  const departureDate = toDate(departureScheduled);
  const arrivalDate = toDate(arrivalScheduled);

  if (!departureDate || !arrivalDate) {
    return "N/A";
  }

  const durationMinutes = Math.max(
    0,
    Math.round((arrivalDate - departureDate) / 60000),
  );
  const durationHours = Math.floor(durationMinutes / 60);
  const durationRemainingMinutes = durationMinutes % 60;

  return `${durationHours}h ${durationRemainingMinutes}min`;
};

const mapFlightWithPrice = (
  flight,
  priceData,
  origin,
  destination,
  date,
  index,
  currency,
) => ({
  id: `${origin}-${destination}-${date}-${index}`,
  airline: flight.airline?.name || "Compagnie inconnue",
  flightNumber: flight.flight?.iata || flight.flight?.number || "N/A",
  origin: flight.departure?.iata || origin,
  originCity: flight.departure?.city || "Ville inconnue",
  originName: flight.departure?.airport || origin,
  destination: flight.arrival?.iata || destination,
  destinationCity: flight.arrival?.city || "Ville inconnue",
  destinationName: flight.arrival?.airport || destination,
  departureTime:
    flight.departure?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
  arrivalTime:
    flight.arrival?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
  duration: formatDuration(
    flight.departure?.scheduled,
    flight.arrival?.scheduled,
  ),
  stops: flight.flight?.stops || 0,
  price: priceData?.value ?? null,
  currency: currency,
  aircraft: flight.aircraft?.model || "Appareil inconnu",
  cabinClass: "Économique",
  availableSeats: 50,
  date: flight.flight_date || date,
  flight_date: flight.flight_date || date,
  flight_status: flight.flight_status || "scheduled",
  bookingLink: priceData?.ticket_link || null,
});

router.get("/search", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      tripType,
      passengers,
      currency = "EUR",
    } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        message: "Paramètres manquants (origin, destination, departureDate)",
      });
    }

    const aviationKey = process.env.AVIATIONSTACK_API_KEY;
    const travelpayoutsToken = process.env.TRAVELPAYOUTS_API_TOKEN;

    if (!aviationKey) {
      return res.status(500).json({
        message: "Clé AviationStack manquante dans le .env",
      });
    }

    if (!travelpayoutsToken) {
      return res.status(500).json({
        message: "Token Travelpayouts manquant dans le .env",
      });
    }

    const departureFlights = await fetchAviationFlights({
      origin,
      destination,
      departureDate,
      apiKey: aviationKey,
    });

    const departurePrices = await fetchAviasalesPrice({
      origin,
      destination,
      departureDate,
      token: travelpayoutsToken,
    });

    const combinedDepartureFlights = departureFlights.map((flight, index) => {
      const selectedPrice = selectBestPriceForFlight(departurePrices, flight);

      return mapFlightWithPrice(
        flight,
        selectedPrice,
        origin,
        destination,
        departureDate,
        index,
        currency,
      );
    });

    let combinedReturnFlights = [];

    if (tripType === "round-trip" && returnDate) {
      const returnFlights = await fetchAviationFlights({
        origin: destination,
        destination: origin,
        departureDate: returnDate,
        apiKey: aviationKey,
      });

      const returnPrices = await fetchAviasalesPrice({
        origin: destination,
        destination: origin,
        departureDate: returnDate,
        token: travelpayoutsToken,
      });

      combinedReturnFlights = returnFlights.map((flight, index) => {
        const selectedPrice = selectBestPriceForFlight(returnPrices, flight);

        return mapFlightWithPrice(
          flight,
          selectedPrice,
          destination,
          origin,
          returnDate,
          index,
          currency,
        );
      });
    }

    return res.json({
      success: true,
      count: combinedDepartureFlights.length,
      departureFlights: combinedDepartureFlights,
      returnFlights: combinedReturnFlights,
      passengers: Number(passengers || 1),
      currency,
    });
  } catch (error) {
    console.error(
      "Erreur recherche vols:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Erreur lors de la recherche des vols",
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = router;

// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// const AVIATIONSTACK_URL = "http://api.aviationstack.com/v1/flights";
// const TRAVELPAYOUTS_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";

// const fetchAviationFlights = async ({ origin, destination, departureDate, apiKey }) => {
//   const response = await axios.get(AVIATIONSTACK_URL, {
//     params: {
//       access_key: apiKey,
//       dep_iata: origin.toUpperCase(),
//       arr_iata: destination.toUpperCase(),
//       flight_date: departureDate,
//       limit: 100,
//     },
//   });

//   return response.data.data || [];
// };

// const fetchAviasalesPrice = async ({
//   origin,
//   destination,
//   departureDate,
//   token,
//   currency = "EUR",
// }) => {
//   const response = await axios.get(TRAVELPAYOUTS_URL, {
//     params: {
//       token,
//       origin: origin.toUpperCase(),
//       destination: destination.toUpperCase(),
//       departure_at: departureDate,
//       currency,
//       direct: false,
//       limit: 1,
//       sorting: "price",
//     },
//   });

//   const values = response.data?.data || [];
//   return values.length ? values[0] : null;
// };

// const mapFlightWithPrice = (flight, priceData, origin, destination, date, index, currency) => ({
//   id: `${origin}-${destination}-${date}-${index}`,
//   airline: flight.airline?.name || "Compagnie inconnue",
//   flightNumber: flight.flight?.iata || flight.flight?.number || "N/A",
//   origin: flight.departure?.iata || origin,
//   originCity: flight.departure?.city || "Ville inconnue",
//   originName: flight.departure?.airport || origin,
//   destination: flight.arrival?.iata || destination,
//   destinationCity: flight.arrival?.city || "Ville inconnue",
//   destinationName: flight.arrival?.airport || destination,
//   departureTime: flight.departure?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//   arrivalTime: flight.arrival?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//   duration: flight.flight?.duration || "N/A",
//   stops: flight.flight?.stops || 0,
//   price: priceData?.price ?? null,
//   currency: priceData?.currency || currency,
//   aircraft: flight.aircraft?.model || "Appareil inconnu",
//   cabinClass: "Économique",
//   availableSeats: 50,
//   date: flight.flight_date || date,
//   flight_date: flight.flight_date || date,
//   flight_status: flight.flight_status || "scheduled",
//   bookingLink: priceData?.link || null,
// });

// router.get("/search", async (req, res) => {
//   try {
//     const {
//       origin,
//       destination,
//       departureDate,
//       returnDate,
//       tripType,
//       passengers,
//       currency = "EUR",
//     } = req.query;

//     if (!origin || !destination || !departureDate) {
//       return res.status(400).json({
//         message: "Paramètres manquants (origin, destination, departureDate)",
//       });
//     }

//     const aviationKey = process.env.AVIATIONSTACK_API_KEY;
//     const travelpayoutsToken = process.env.TRAVELPAYOUTS_API_TOKEN;

//     if (!aviationKey) {
//       return res.status(500).json({
//         message: "Clé AviationStack manquante dans le .env",
//       });
//     }

//     if (!travelpayoutsToken) {
//       return res.status(500).json({
//         message: "Token Travelpayouts manquant dans le .env",
//       });
//     }

//     const departureFlights = await fetchAviationFlights({
//       origin,
//       destination,
//       departureDate,
//       apiKey: aviationKey,
//     });

//     const departurePrice = await fetchAviasalesPrice({
//       origin,
//       destination,
//       departureDate,
//       token: travelpayoutsToken,
//       currency,
//     });

//     const combinedDepartureFlights = departureFlights.map((flight, index) =>
//       mapFlightWithPrice(
//         flight,
//         departurePrice,
//         origin,
//         destination,
//         departureDate,
//         index,
//         currency
//       )
//     );

//     let combinedReturnFlights = [];

//     if (tripType === "round-trip" && returnDate) {
//       const returnFlights = await fetchAviationFlights({
//         origin: destination,
//         destination: origin,
//         departureDate: returnDate,
//         apiKey: aviationKey,
//       });

//       const returnPrice = await fetchAviasalesPrice({
//         origin: destination,
//         destination: origin,
//         departureDate: returnDate,
//         token: travelpayoutsToken,
//         currency,
//       });

//       combinedReturnFlights = returnFlights.map((flight, index) =>
//         mapFlightWithPrice(
//           flight,
//           returnPrice,
//           destination,
//           origin,
//           returnDate,
//           index,
//           currency
//         )
//       );
//     }

//     return res.json({
//       success: true,
//       count: combinedDepartureFlights.length,
//       departureFlights: combinedDepartureFlights,
//       returnFlights: combinedReturnFlights,
//       passengers: Number(passengers || 1),
//       currency,
//     });
//   } catch (error) {
//     console.error("Erreur recherche vols:", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Erreur lors de la recherche des vols",
//       error: error.response?.data?.error?.message || error.message,
//     });
//   }
// });

// module.exports = router;

// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// // 🔹 Fonction pour récupérer le prix depuis Aviasale
// const getFlightPriceFromAviasale = async (origin, destination, departureDate, currency = "EUR") => {
//   try {
//     const token = process.env.TRAVELPAYOUTS_API_TOKEN;
//     if (!token) {
//       console.warn("⚠️ Token Travelpayouts manquante dans le .env → prix par défaut");
//       return null;
//     }

//     const apiUrl = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";

//     const response = await axios.get(apiUrl, {
//       params: {
//         token: token,
//         origin: origin.toUpperCase(),
//         destination: destination.toUpperCase(),
//         departure_at: departureDate,
//         currency: currency,
//         direct: false,
//         limit: 10,
//         sorting: "price"
//       },
//     });

//     const data = response.data;
//     if (data && data.success && data.values && data.values.length > 0) {
//       // Retourner le prix le plus bas
//       const cheapest = data.values[0];
//       return cheapest.price;
//     }

//     return null;
//   } catch (error) {
//     console.error("Erreur Aviasale prix:", error.response?.data || error.message);
//     return null;
//   }
// };

// router.get("/search", async (req, res) => {
//   try {
//     const {
//       origin,
//       destination,
//       departureDate,
//       returnDate,
//       passengers,
//       tripType,
//       currency = "EUR",
//     } = req.query;

//     if (!origin || !destination || !departureDate) {
//       return res.status(400).json({
//         message: "Paramètres manquants (origin, destination, departureDate)",
//       });
//     }

//     const apiKey = process.env.AVIATIONSTACK_API_KEY;
//     if (!apiKey) {
//       return res.status(500).json({
//         message: "Clé AviationStack manquante dans le .env",
//       });
//     }

//     const apiUrl = "http://api.aviationstack.com/v1/flights";

//     const fetchFlights = async (depIata) => {
//       const response = await axios.get(apiUrl, {
//         params: {
//           access_key: apiKey,
//           dep_iata: depIata.toUpperCase(),
//           limit: 100,
//         },
//       });

//       return response.data.data || [];
//     };

//     const allDepartureFlights = await fetchFlights(origin);
//     console.log("origin:", origin);
//     console.log("destination:", destination);
//     console.log("departureDate:", departureDate);
//     console.log("nb vols reçus:", allDepartureFlights.length);

//     // Filtrage pour destination
//     let departureFlights = allDepartureFlights.filter((flight) => {
//       return flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
//     });

//     // Mode démo si aucun vol trouvé
//     if (departureFlights.length === 0 && allDepartureFlights.length > 0) {
//       console.log("⚠️ Aucun vol trouvé pour cette destination exacte. Mode démo activé.");
//       departureFlights = allDepartureFlights.slice(0, 10).map((flight) => ({
//         ...flight,
//         flight_date: departureDate,
//         arrival: {
//           ...flight.arrival,
//           iata: destination.toUpperCase(),
//           airport: `${destination.toUpperCase()} International Airport`,
//         },
//       }));
//     }

//     // 🔹 REQUÊTE PRIX AVIASALE (UNE SEULE pour origin→destination)
//     const aviasalePrice = await getFlightPriceFromAviasale(
//       origin,
//       destination,
//       departureDate,
//       currency
//     );

//     // Ajouter le prix à chaque vol
//     departureFlights = departureFlights.map((flight) => ({
//       ...flight,
//       price: aviasalePrice || 450, // Prix Aviasale ou défaut
//       currency: currency || "EUR",
//     }));

//     let returnFlights = [];
//     if (tripType === "round-trip" && returnDate) {
//       const allReturnFlights = await fetchFlights(destination);

//       returnFlights = allReturnFlights.filter((flight) => {
//         const matchOrigin = flight.arrival?.iata?.toUpperCase() === origin.toUpperCase();
//         const matchDate = flight.flight_date === returnDate;
//         return matchOrigin && matchDate;
//       });

//       // 🔹 REQUÊTE PRIX AVIASALE pour retour (destination→origin)
//       const returnAviasalePrice = await getFlightPriceFromAviasale(
//         destination,
//         origin,
//         returnDate,
//         currency
//       );

//       returnFlights = returnFlights.map((flight) => ({
//         ...flight,
//         price: returnAviasalePrice || 450,
//         currency: currency || "EUR",
//       }));
//     }

//     return res.json({
//       success: true,
//       count: departureFlights.length,
//       departureFlights,
//       returnFlights,
//       passengers: Number(passengers || 1),
//       currency: currency || "EUR",
//     });
//   } catch (error) {
//     console.error("Détails de l'erreur API :", error.response?.data || error.message);

//     return res.status(500).json({
//       message: "Erreur lors de la recherche des vols",
//       error: error.response?.data?.error?.message || error.message,
//     });
//   }
// });

// // Route pour récupérer UN vol spécifique (inchangée)
// router.get("/:id", async (req, res) => {
//   try {
//     const flightId = req.params.id;
//     const parts = flightId.split("-");

//     if (parts.length >= 4) {
//       const origin = parts[0];
//       const destination = parts[1];
//       const date = parts.slice(2, 4).join("-");

//       const response = await axios.get("http://api.aviationstack.com/v1/flights", {
//         params: {
//           access_key: process.env.AVIATIONSTACK_API_KEY,
//           dep_iata: origin,
//           arr_iata: destination,
//           flight_date: date
//         }
//       });

//       const flights = response.data.results || [];
//       const index = parseInt(parts[parts.length - 1]);

//       if (!flights[index]) {
//         return res.status(404).json({
//           error: "Vol non trouvé",
//           message: `Aucun vol à l'index ${index} pour cette recherche`
//         });
//       }

//       const aviationFlight = flights[index];

//       // 🔹 Récupérer le prix Aviasale pour ce vol
//       const aviasalePrice = await getFlightPriceFromAviasale(
//         origin,
//         destination,
//         date,
//         "EUR"
//       );

//       const flight = {
//         id: flightId,
//         airline: aviationFlight.airline?.name || "Compagnie inconnue",
//         flightNumber: aviationFlight.flight?.number || aviationFlight.flight?.iata || "N/A",
//         origin: aviationFlight.departure?.iata || origin,
//         originCity: aviationFlight.departure?.city || "Ville inconnue",
//         originName: aviationFlight.departure?.airport || aviationFlight.departure?.iata || origin,
//         destination: aviationFlight.arrival?.iata || destination,
//         destinationCity: aviationFlight.arrival?.city || "Ville inconnue",
//         destinationName: aviationFlight.arrival?.airport || aviationFlight.arrival?.iata || destination,
//         departureTime: aviationFlight.departure?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//         arrivalTime: aviationFlight.arrival?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//         duration: aviationFlight.flight?.duration?.text || "Calculer",
//         stops: 0,
//         price: aviasalePrice || 450, // 🔹 Prix Aviasale
//         currency: "EUR",
//         aircraft: aviationFlight.aircraft?.model || "Appareil inconnue",
//         cabinClass: "Économique",
//         availableSeats: 50,
//         date: date || aviationFlight.flight_date || new Date().toISOString().split("T")[0],
//         flight_date: date || aviationFlight.flight_date || new Date().toISOString().split("T")[0],
//         flight_status: aviationFlight.flight_status || "scheduled"
//       };

//       return res.json(flight);
//     }

//     return res.status(400).json({
//       error: "ID de vol invalide",
//       message: "Format d'ID attendu: ORIGIN-DESTINATION-DATE-INDEX"
//     });
//   } catch (error) {
//     console.error("Erreur récupération du vol:", error.response?.data || error.message);

//     if (error.response?.status === 401) {
//       return res.status(500).json({
//         error: "Erreur API AviationStack",
//         message: "Clé API invalide ou manquante"
//       });
//     }

//     if (error.response?.status === 404) {
//       return res.status(404).json({
//         error: "Vol non trouvé",
//         message: "Aucun vol trouvé pour ces critères"
//       });
//     }

//     return res.status(500).json({
//       error: "Erreur serveur",
//       message: error.message
//     });
//   }
// });

// module.exports = router;

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
//       return res.status(400).json({
//         message: "Paramètres manquants (origin, destination, departureDate)",
//       });
//     }

//     const apiKey = process.env.AVIATIONSTACK_API_KEY;
//     if (!apiKey) {
//       return res.status(500).json({
//         message: "Clé AviationStack manquante dans le .env",
//       });
//     }

//     const apiUrl = "http://api.aviationstack.com/v1/flights";

//     const fetchFlights = async (depIata) => {
//       const response = await axios.get(apiUrl, {
//         params: {
//           access_key: apiKey,
//           dep_iata: depIata.toUpperCase(),
//           limit: 100,
//         },
//       });

//       return response.data.data || [];
//     };

//     const allDepartureFlights = await fetchFlights(origin);
//     console.log("origin:", origin);
//     console.log("destination:", destination);
//     console.log("departureDate:", departureDate);
//     console.log("nb vols reçus:", allDepartureFlights.length);
//     console.log("exemple vol:", allDepartureFlights[0]);

//     // Modifiez temporairement votre filtre pour qu'il soit moins strict pendant que vous créez votre design. Si l'API ne trouve pas la date exacte ou la destination exacte, vous forcez l'affichage des vols reçus pour pouvoir tester votre interface React.

//     // const departureFlights = allDepartureFlights.filter((flight) => {
//     //   const matchDestination =
//     //     flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
//     //   const matchDate = flight.flight_date === departureDate;
//     //   return matchDestination && matchDate;
//     // });
//     // Filtrage intelligent pour le développement
//     let departureFlights = allDepartureFlights.filter((flight) => {
//       return flight.arrival?.iata?.toUpperCase() === destination.toUpperCase();
//     });

//     // 💡 Astuce de secours : Si aucun vol ne va à cette destination spécifique dans le lot des 100,
//     // on prend les vols disponibles et on change artificiellement leur destination pour vos tests React.
//     if (departureFlights.length === 0 && allDepartureFlights.length > 0) {
//       console.log(
//         "⚠️ Aucun vol trouvé pour cette destination exacte. Mode démo activé.",
//       );
//       departureFlights = allDepartureFlights.slice(0, 10).map((flight) => ({
//         ...flight,
//         flight_date: departureDate, // On force la date recherchée
//         arrival: {
//           ...flight.arrival,
//           iata: destination.toUpperCase(), // On force la destination recherchée
//           airport: `${destination.toUpperCase()} International Airport`,
//         },
//       }));
//     }

//     let returnFlights = [];
//     if (tripType === "round-trip" && returnDate) {
//       const allReturnFlights = await fetchFlights(destination);

//       returnFlights = allReturnFlights.filter((flight) => {
//         const matchOrigin =
//           flight.arrival?.iata?.toUpperCase() === origin.toUpperCase();
//         const matchDate = flight.flight_date === returnDate;
//         return matchOrigin && matchDate;
//       });
//       console.log("nb vols après filtrage:", departureFlights.length);
//     }

//     return res.json({
//       success: true,
//       count: departureFlights.length,
//       departureFlights,
//       returnFlights,
//       passengers: Number(passengers || 1),
//     });
//   } catch (error) {
//     console.error(
//       "Détails de l'erreur API :",
//       error.response?.data || error.message,
//     );

//     return res.status(500).json({
//       message: "Erreur lors de la recherche des vols",
//       error: error.response?.data?.error?.message || error.message,
//     });
//   }
// });

// // Nouvelle route pour récupérer UN vol spécifique via son ID

// router.get("/:id", async (req, res) => {
//   try {
//     const flightId = req.params.id;

//     // ✅ Parse l'ID pour extraire les informations
//     // Ton frontend envoie: /flight/CDG-DLA-2026-05-30-1234?origin=CDG&destination=DLA&date=2026-05-30
//     // Tu peux encoder l'ID différemment selon comment tu le génères dans FlightCard

//     // Exemple: si l'ID est de la forme "CDG-DLA-2026-05-30-0" (index dans le tableau)
//     // Tu peux le parser ainsi :
//     const parts = flightId.split("-");

//     // Si tu stockes origin, destination, date et index dans l'ID
//     if (parts.length >= 4) {
//       const origin = parts[0];
//       const destination = parts[1];
//       const date = parts.slice(2, 4).join("-"); // reconstitue la date

//       // Appel réel à AviationStack
//       const response = await axios.get(AVIATION_STACK_API_URL, {
//         params: {
//           access_key: AVIATION_STACK_API_KEY,
//           dep_iata: origin,
//           arr_iata: destination,
//           flight_date: date
//         }
//       });

//       const flights = response.data.results || [];

//       // Trouve le vol à l'index correspondant (dernier élément de parts)
//       const index = parseInt(parts[parts.length - 1]);

//       if (!flights[index]) {
//         return res.status(404).json({
//           error: "Vol non trouvé",
//           message: `Aucun vol à l'index ${index} pour cette recherche`
//         });
//       }

//       const aviationFlight = flights[index];

//       // ✅ MAPPER LES DONNÉES D'AVIATIONSTACK → FORMAT FRONTEND
//       const flight = {
//         id: flightId && flightId !== 0 ? flightId : `flight-${Date.now()}`, // fallback ID
//         airline: aviationFlight.airline?.name || "Compagnie inconnue",
//         flightNumber: aviationFlight.flight?.number || aviationFlight.flight?.iata || "N/A",
//         origin: aviationFlight.departure?.iata ||"XYZ" || origin,
//         originCity: aviationFlight.departure?.city || "Ville inconnue",
//         originName: aviationFlight.departure?.airport || aviationFlight.departure?.iata || origin,
//         destination: aviationFlight.arrival?.iata ||"XYZ" || destination,
//         destinationCity: aviationFlight.arrival?.city || "Ville inconnue",
//         destinationName: aviationFlight.arrival?.airport || aviationFlight.arrival?.iata || destination,
//         departureTime: aviationFlight.departure?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//         arrivalTime: aviationFlight.arrival?.scheduled?.split("T")[1]?.substring(0, 5) || "00:00",
//         duration: aviationFlight.flight?.duration?.text || "Calculer",
//         stops: 0, // AviationStack ne renvoie pas directement le nombre d'escales
//         price: 450, // Tu dois avoir ce champ dans ton frontend ou le récupérer ailleurs
//         aircraft: aviationFlight.aircraft?.model || "Appareil inconnu",
//         cabinClass: "Économique", // à définir selon ton système
//         availableSeats: 50, // à définir selon ton système
//         date: date || aviationFlight.flight_date || new Date().toISOString().split("T")[0],
//         flight_date: date || aviationFlight.flight_date || new Date().toISOString().split("T")[0],
//         flight_status: aviationFlight.flight_status || "scheduled"
//       };

//       return res.json(flight);
//     }

//     // ❌ Si l'ID n'est pas dans le bon format
//     return res.status(400).json({
//       error: "ID de vol invalide",
//       message: "Format d'ID attendu: ORIGIN-DESTINATION-DATE-INDEX (ex: CDG-DLA-2026-05-30-0)"
//     });

//   } catch (error) {
//     console.error("Erreur récupération du vol:", error.response?.data || error.message);

//     if (error.response?.status === 401) {
//       return res.status(500).json({
//         error: "Erreur API AviationStack",
//         message: "Clé API invalide ou manquante"
//       });
//     }

//     if (error.response?.status === 404) {
//       return res.status(404).json({
//         error: "Vol non trouvé",
//         message: "Aucun vol trouvé pour ces critères"
//       });
//     }

//     return res.status(500).json({
//       error: "Erreur serveur",
//       message: error.message
//     });
//   }
// });

// module.exports = router;
