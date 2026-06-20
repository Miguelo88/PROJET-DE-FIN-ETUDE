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
  //  ajout de cett API REST de travelpayouts pour faire fonctionner bookingLink
  const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&departure_at=${departureDate}&one_way=true&direct=false&sorting=price&limit=10&token=${token}`;

  const linkresponse = await axios.get(url);

  return linkresponse.data?.data || [];
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

// option ajouter pour faire fonctionner le bookingLink

const buildAviasalesSearchLink = (origin, destination, date) => {
  if (!origin || !destination || !date) return null;

  const formattedDate = date.slice(0, 10); // YYYY-MM-DD
  const day = formattedDate.split("-")[0];
  const month = formattedDate.split("-")[1];
  const year = formattedDate.split("-")[2];

  return `https://www.aviasales.com/search/${origin}${day}${month}${year}${destination}1`;
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

  bookingLink: priceData?.link
    ? `https://www.aviasales.com${priceData.link}`
    : buildAviasalesSearchLink(origin, destination, date),
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
    // JE L'AI REMPLACE POUR AFFICHER LES MOCKDATA
    // console.error(
    //   "Erreur recherche vols:",
    //   error.response?.data || error.message,
    // );

    console.error(
      "Erreur recherche vols (Déclenchement du Fallback Mock):",
      error.message,
    );

    // 🚀 SYSTÈME DE SECOURS SIMULÉ (MOCK) : Génère des vols pour éviter le blocage API
    const mockDepartureFlights = [
      {
        id: `${req.query.origin}-${req.query.destination}-${req.query.departureDate}-0`,
        airline: "Virgin Atlantic",
        flightNumber: "VS6827",
        airlineCode: "VS",
        price: 250,
        currency: req.query.currency || "EUR",
        duration: "2h 25min",
        departureTime: "19:30",
        arrivalTime: "21:55",
        stops: 0,
        origin: req.query.origin,
        destination: req.query.destination,
        departureAirport: "Aéroport Principal",
        arrivalAirport: "Aéroport Destination",
        cabinClass: "Économique",
        status: "active",
        bookingLink: "#",
        date: req.query.departureDate,
      },
    ];

    let mockReturnFlights = [];
    if (req.query.tripType === "round-trip" && req.query.returnDate) {
      mockReturnFlights = [
        {
          id: `${req.query.destination}-${req.query.origin}-${req.query.returnDate}-0`,
          airline: "Virgin Atlantic",
          flightNumber: "VS6828",
          airlineCode: "VS",
          price: 230,
          currency: req.query.currency || "EUR",
          duration: "2h 30min",
          departureTime: "08:00",
          arrivalTime: "10:30",
          stops: 0,
          origin: req.query.destination,
          destination: req.query.origin,
          departureAirport: "Aéroport Destination",
          arrivalAirport: "Aéroport Principal",
          cabinClass: "Économique",
          status: "active",
          bookingLink: "#",
          date: req.query.returnDate,
        },
      ];
    }

    // Renvoie les fausses données structurées exactement comme la vraie API
    return res.json({
      success: true,
      count: mockDepartureFlights.length,
      departureFlights: mockDepartureFlights,
      returnFlights: mockReturnFlights,
      passengers: Number(req.query.passengers || 1),
      currency: req.query.currency || "EUR",
      isMockData: true, // Petit indicateur utile pour vous
    });
  }
});
//     return res.status(500).json({
//       message: "Erreur lors de la recherche des vols",
//       error: error.response?.data?.error?.message || error.message,
//     });
//   }
// });

module.exports = router;
