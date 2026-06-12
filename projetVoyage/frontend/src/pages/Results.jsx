import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FlightCard } from "../features/FlightResult/components/FlightCard";
import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { airports } from "../data/mockFlights";
import { Plane } from "lucide-react";

function mapApiFlightToCard(flightItem, index) {
  const departureTime =
    flightItem.departureTime ||
    (flightItem.departure?.scheduled
      ? new Date(flightItem.departure.scheduled).toTimeString().slice(0, 5)
      : "00:00");
  const arrivalTime =
    flightItem.arrivalTime ||
    (flightItem.arrival?.scheduled
      ? new Date(flightItem.arrival.scheduled).toTimeString().slice(0, 5)
      : "00:00");
  const duration = flightItem.duration || "N/A";
  const originLabel =
    flightItem.originCity ||
    flightItem.departureAirport ||
    flightItem.origin ||
    flightItem.departure?.airport ||
    "Aéroport de départ";
  const destinationLabel =
    flightItem.destinationCity ||
    flightItem.arrivalAirport ||
    flightItem.destination ||
    flightItem.arrival?.airport ||
    "Aéroport d'arrivée";
  const priceValue =
    flightItem.price === null || flightItem.price === undefined
      ? null
      : Number(flightItem.price);
  const stopsValue =
    typeof flightItem.stops === "number"
      ? flightItem.stops
      : Number.isFinite(Number(flightItem.stops))
        ? Number(flightItem.stops)
        : flightItem.flight?.codeshared
          ? 1
          : 0;

  return {
    id: flightItem.id || `${index}`,
    airline:
      flightItem.airline?.name || flightItem.airline || "Compagnie inconnue",
    flightNumber:
      flightItem.flightNumber ||
      flightItem.flight?.iata ||
      `${flightItem.airline?.iata || ""}${flightItem.flight?.number || ""}` ||
      "N/A",
    airlineCode: flightItem.airline?.iata || "XX",
    price: priceValue,
    currency: flightItem.currency || "EUR",
    duration,
    departureTime,
    arrivalTime,
    stops: stopsValue,
    origin: `${originLabel} (${flightItem.origin || flightItem.departure?.iata || ""})`,
    destination: `${destinationLabel} (${flightItem.destination || flightItem.arrival?.iata || ""})`,
    departureAirport:
      flightItem.originName ||
      flightItem.departure?.airport ||
      "Aéroport de départ",
    arrivalAirport:
      flightItem.destinationName ||
      flightItem.arrival?.airport ||
      "Aéroport d'arrivée",
    departureTerminal:
      flightItem.departureTerminal || flightItem.departure?.terminal || "",
    arrivalTerminal:
      flightItem.arrivalTerminal || flightItem.arrival?.terminal || "",
    aircraft:
      flightItem.aircraft?.iata ||
      flightItem.aircraft?.icao ||
      flightItem.aircraft ||
      `Aircraft ${flightItem.aircraft?.icao24 || "non renseigné"}`,
    cabinClass: flightItem.cabinClass || "Économique",
    status: flightItem.flight_status || flightItem.status,
    bookingLink: flightItem.bookingLink || null,
    date: flightItem.date || flightItem.flight_date || null,
  };
}

export function Results() {
  const [searchParams] = useSearchParams();

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";
  const tripType = searchParams.get("tripType") || "one-way";
  const returnDate = searchParams.get("returnDate") || null;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [filteredFlights, setFilteredFlights] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [stops, setStops] = useState("all");
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");

  useEffect(() => {
    if (!origin || !destination || !date) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);

    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: date,
      passengers,
      tripType,
    });

    if (tripType === "round-trip" && returnDate) {
      params.append("returnDate", returnDate);
    }

    fetch(`/api/flights/search?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("ÉTAPE 1: data.count =", data.count);
        console.log("ÉTAPE 2: data.departureFlights =", data.departureFlights);

        const mapped = Array.isArray(data.departureFlights)
          ? data.departureFlights.map((f, i) => mapApiFlightToCard(f, i))
          : [];

        // ✅ AJOUTE CETTE LIGNE ICI :
        localStorage.setItem("searchResults", JSON.stringify(mapped));
        console.log(
          "✅ Vols enregistrés dans localStorage :",
          mapped.length,
          "vols",
        );

        setFlights(mapped);

        const max = Math.max(0, ...mapped.map((f) => f.price));
        setMaxPrice(max);
        setPriceRange([0, max]);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la requête des vols :", err);
        setError(true);
        setLoading(false);
      });
  }, [origin, destination, date, passengers, tripType, returnDate]);

  useEffect(() => {
    if (loading || flights.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredFlights([]);
      return;
    }

    let filtered = [...flights];

    if (Array.isArray(priceRange) && priceRange.length === 2) {
      filtered = filtered.filter(
        (f) => f.price >= priceRange[0] && f.price <= priceRange[1],
      );
    }

    if (stops === "direct") {
      filtered = filtered.filter((f) => f.stops === 0);
    } else if (stops === "1-stop") {
      filtered = filtered.filter((f) => f.stops <= 1);
    }

    if (selectedAirlines.length > 0) {
      filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "duration-asc":
        filtered.sort((a, b) => {
          const durationA = parseInt(a.duration.split("h")[0], 10) || 0;
          const durationB = parseInt(b.duration.split("h")[0], 10) || 0;
          return durationA - durationB;
        });
        break;
      case "departure-asc":
        filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case "departure-desc":
        filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
        break;
      default:
        break;
    }

    setFilteredFlights(filtered);
  }, [flights, priceRange, stops, selectedAirlines, sortBy, loading]);

  const uniqueAirlines = Array.from(new Set(flights.map((f) => f.airline)));

  const originCity = airports.find((a) => a.code === origin)?.city || origin;
  const destinationCity =
    airports.find((a) => a.code === destination)?.city || destination;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des vols…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Impossible de charger les vols. Réessayez plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {originCity} → {destinationCity}
          </h2>
          <p className="text-gray-600">
            {new Date(date).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {passengers} {passengers === "1" ? "passager" : "passagers"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {filteredFlights.length} vol
            {filteredFlights.length > 1 ? "s" : ""} trouvé
            {filteredFlights.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterSidebar
              maxPrice={maxPrice}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              stops={stops}
              onStopsChange={setStops}
              airlines={uniqueAirlines}
              selectedAirlines={selectedAirlines}
              onAirlinesChange={setSelectedAirlines}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.length === 0 && !loading && !error ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Aucun vol trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos filtres ou vos critères de recherche
                </p>
              </div>
            ) : (
              filteredFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { FlightCard } from "../features/FlightResult/components/FlightCard";
// import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
// import { Header } from "../composants/shared/Header";
// import { Footer } from "../composants/shared/Footer";
// import { airports } from "../data/mockFlights";
// import { Plane } from "lucide-react";

// /**
//  * Fonction utilitaire qui transforme un vol d'AvionStack (ou API externe)
//  * vers le format attendu par FlightCard (prix, durée, horaires, etc.)
//  *
//  * À vérifier :
//  * - Structure de flightItem.departure.scheduled et .arrival.scheduled
//  *   → Doit être une string parseable (ex: "2025-05-26T10:00:00Z"),
//  *   sinon new Date() sera NaN et les horaires ne seront pas affichés.
//  */
// function mapApiFlightToCard(flightItem, index) {
//   // 1. Récupération sécurisée du numéro de vol et du code de la compagnie
//   // Si flightItem.flight.iata existe (ex: "BZ251"), on l'utilise, sinon on combine le code iata compagnie et le numéro
//   const flightNumber =
//     flightItem.flight?.iata ||
//     `${flightItem.airline?.iata || ""}${flightItem.flight?.number || ""}` ||
//     "N/A";

//   // Extraction sécurisée du code de la compagnie pour le logo (ex: "BZ")
//   const airlineCode =
//     flightItem.airline?.iata || flightItem.flight?.iata?.slice(0, 2) || "XX";

//   // Heure de départ et d’arrivée des vols
//   const dep = new Date(flightItem.departure.scheduled);
//   const arr = new Date(flightItem.arrival.scheduled);

//   // 💡 Option : vérifier que les dates sont valides
//   if (isNaN(dep) || isNaN(arr)) {
//     console.warn("Vol avec date invalide", flightItem);
//     // Tu peux choisir de le filtrer ou de lui donner des valeurs par défaut ici
//   }

//   // Calcul de la durée en minutes, puis conversion en h + min
//   const durationMinutes = Math.round((arr - dep) / 60000);
//   const durationHours = Math.floor(durationMinutes / 60);
//   const durationMin = durationMinutes % 60;

//   return {
//     id: `api-${index}`, // clé unique pour React
//     flight: flightNumber,
//     // flight: flightItem.flight, // numéro de vol
//     // j'ai remplace ce code par celui en dessous airline: flightItem.airline, // compagnie
//     airline: flightItem.airline.airline_name || "Compagnie inconnue", // compagnie
//     airlineCode: airlineCode.toUpperCase(), // extrait le code compagnie proprement
//     // airlineCode: flightItem.flight.split(/(\d+)/)[0], // extrait le code compagnie
//     // À terme, le prix viendra de l’API (ou d’un calcul réaliste côté backend)
//     price: 199 + Math.floor(Math.random() * 400),
//     stops: 0, // on considère "direct" ici
//     duration: `${durationHours}h ${durationMin}min`,

//     departureTime: isNaN(dep.getTime())
//       ? "00:00"
//       : dep.toTimeString().slice(0, 5), // format HH:MM
//     arrivalTime: isNaN(arr.getTime())
//       ? "00:00"
//       : arr.toTimeString().slice(0, 5), // format HH:MM
//     departureAirport: flightItem.departure.airport || "Aéroport de départ",
//     arrivalAirport: flightItem.arrival.airport || "Aéroport d'arrivée",
//     departureTerminal: flightItem.departure.terminal || "",
//     arrivalTerminal: flightItem.arrival.terminal || "",
//     // departureTime: dep.toTimeString().slice(0, 5), // format HH:MM
//     // arrivalTime: arr.toTimeString().slice(0, 5), // format HH:MM
//     // departureAirport: flightItem.departure.airport,
//     // arrivalAirport: flightItem.arrival.airport,
//     // departureTerminal: flightItem.departure.terminal,
//     // arrivalTerminal: flightItem.arrival.terminal,
//     // j'ai remplace ce code par celui en dessous status: flightItem.status,
//     status: flightItem.flight_status,
//   };
// }

// /**
//  * Écran des résultats de recherche de vols
//  * - Récupère les params depuis l’URL (origin, destination, date, etc.)
//  * - Appelle /api/flights/search via fetch
//  * - Gère loading / error
//  * - Filtre et trie les vols côté client
//  */
// export function Results() {
//   // Lecture des paramètres de recherche dans l’URL (via ?origin=...&destination=...&date=...)
//   const [searchParams] = useSearchParams();

//   // Extraction des valeurs de recherche
//   const origin = searchParams.get("origin") || ""; // ex: "NSI"
//   const destination = searchParams.get("destination") || ""; // ex: "DLA"
//   const date = searchParams.get("date") || ""; // ex: "2025-05-26"
//   const passengers = searchParams.get("passengers") || "1";
//   const tripType = searchParams.get("tripType") || "one-way";
//   const returnDate = searchParams.get("returnDate") || null;

//   // ✅ VÉRIFIER :
//   //   - origin et destination sont bien des codes d’aéroport (ex: "NSI", "DLA")
//   //   - date est bien au format YYYY-MM-DD pour que new Date(date) fonctionne proprement
//   //   - Si un champ est manquant côté client (URL invalide), tu peux vouloir :
//   //       - rediriger ou afficher un message d’erreur au lieu de lancer la requête.

//   // ---------- ÉTAT PRINCIPAL DES VOLS ----------
//   const [flights, setFlights] = useState([]); // vols “bruts” mappés pour FlightCard
//   const [loading, setLoading] = useState(true); // indique que l’API charge
//   const [error, setError] = useState(false); // erreur réseau ou API

//   // ---------- FILTRES ET TRI ----------
//   const [filteredFlights, setFilteredFlights] = useState([]);
//   const [priceRange, setPriceRange] = useState([0, 1000]); // plage de prix actuelle
//   const [maxPrice, setMaxPrice] = useState(1000); // prix max trouvé dans cette recherche
//   const [stops, setStops] = useState("all"); // "all" | "direct" | "1-stop"
//   const [selectedAirlines, setSelectedAirlines] = useState([]);
//   const [sortBy, setSortBy] = useState("price-asc"); // tri actuel

//   // ---------- RÉCUPÉRATION DES VOLS VIA L’API BACKEND ----------
//   useEffect(() => {
//     // Si les champs obligatoires manquent, on ne lance pas la recherche
//     if (!origin || !destination || !date) return;

//     // Indique le début du chargement
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     setLoading(true);
//     setError(false);

//     // Construction des paramètres de l’URL
//     const params = new URLSearchParams({
//       origin,
//       destination,
//       departureDate: date,
//       passengers,
//       tripType,
//     });

//     // Si vol aller-retour, on ajoute returnDate
//     if (tripType === "round-trip" && returnDate) {
//       params.append("returnDate", returnDate);
//     }

//     // Appel de ton backend
//     // ✅ VÉRIFIER :
//     //   - Le backend répond bien à `/api/flights/search`
//     //   - Le proxy Vite est bien configuré (target: http://localhost:5000)
//     //   - Le backend renvoie exactement :
//     //       { departureFlights: [...] } et éventuellement returnFlights
//     fetch(`/api/flights/search?${params}`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         // ➤➤➤ ADD THESE LINES <<<➤➤➤
//         console.log("ÉTAPE 1: data.count =", data.count);
//         console.log("ÉTAPE 2: data.departureFlights =", data.departureFlights);
//         // On mape chaque vol de departureFlights vers le format de FlightCard
//         const mapped = data.departureFlights.map((f, i) =>
//           mapApiFlightToCard(f, i),
//         );
//         setFlights(mapped);

//         // Calcul du prix max pour ajuster le slider/filtre
//         const max = Math.max(0, ...mapped.map((f) => f.price));
//         setMaxPrice(max);
//         setPriceRange([0, max]);

//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Erreur lors de la requête des vols :", err);
//         setError(true);
//         setLoading(false);
//       });
//     // ✅ Option : tu peux ajouter un timeout ou un indicateur de retry ici
//   }, [origin, destination, date, passengers, tripType, returnDate]);

//   // ---------- FILTRES ET TRI (appliqués à chaque changement d’état) ----------
//   useEffect(() => {
//     // Si on attend encore les données, ou s'il n'y a aucun vol, on vide et on sort
//     if (loading || flights.length === 0) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setFilteredFlights([]);
//       return;
//     }

//     let filtered = [...flights];

//     // Filtre par prix avec sécurité
//     if (Array.isArray(priceRange) && priceRange.length === 2) {
//       filtered = filtered.filter(
//         (f) => f.price >= priceRange[0] && f.price <= priceRange[1],
//       );
//     }

//     // Filtre par escales
//     if (stops === "direct") {
//       filtered = filtered.filter((f) => f.stops === 0);
//     } else if (stops === "1-stop") {
//       filtered = filtered.filter((f) => f.stops <= 1);
//     }

//     // Filtre par compagnie
//     if (selectedAirlines.length > 0) {
//       filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
//     }

//     // Tri
//     switch (sortBy) {
//       case "price-asc":
//         filtered.sort((a, b) => a.price - b.price);
//         break;
//       case "price-desc":
//         filtered.sort((a, b) => b.price - a.price);
//         break;
//       case "duration-asc":
//         filtered.sort((a, b) => {
//           const durationA = parseInt(a.duration.split("h")[0], 10) || 0;
//           const durationB = parseInt(b.duration.split("h")[0], 10) || 0;
//           return durationA - durationB;
//         });
//         break;
//       case "departure-asc":
//         filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
//         break;
//       case "departure-desc":
//         filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
//         break;
//       default:
//         break;
//     }

//     setFilteredFlights(filtered);
//   }, [flights, priceRange, stops, selectedAirlines, sortBy, loading]);

//   // useEffect(() => {
//   //   let filtered = [...flights];

//   //   // Si on est encore en chargement ou qu’il n’y a aucun vol, on ne filtre pas
//   //   if (!loading && flights.length > 0) {
//   //     // Filtre par prix
//   //     filtered = filtered.filter(
//   //       (f) => f.price >= priceRange[0] && f.price <= priceRange[1],
//   //     );

//   //     // Filtre par escales
//   //     if (stops === "direct") {
//   //       filtered = filtered.filter((f) => f.stops === 0);
//   //     } else if (stops === "1-stop") {
//   //       filtered = filtered.filter((f) => f.stops <= 1); // 0 ou 1 escale
//   //     } // autres cas ("all") laissent tout passer

//   //     // Filtre par compagnie
//   //     if (selectedAirlines.length > 0) {
//   //       filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
//   //     }

//   //     // Tri
//   //     switch (sortBy) {
//   //       case "price-asc":
//   //         filtered.sort((a, b) => a.price - b.price);
//   //         break;
//   //       case "price-desc":
//   //         filtered.sort((a, b) => b.price - a.price);
//   //         break;
//   //       case "duration-asc":
//   //         filtered.sort((a, b) => {
//   //           // ✅ À améliorer :
//   //           //   - duration est au format "3h 15min"
//   //           //   - Ici tu ne tiens compte que des heures, pas des minutes.
//   //           const durationA = parseInt(a.duration.split("h")[0]);
//   //           const durationB = parseInt(b.duration.split("h")[0]);
//   //           return durationA - durationB;
//   //         });
//   //         break;
//   //       case "departure-asc":
//   //         // ✅ Vérifier que departureTime est bien HH:MM
//   //         //    (24h) pour que localeCompare fonctionne correctement.
//   //         filtered.sort((a, b) =>
//   //           a.departureTime.localeCompare(b.departureTime),
//   //         );
//   //         break;
//   //       case "departure-desc":
//   //         filtered.sort((a, b) =>
//   //           b.departureTime.localeCompare(a.departureTime),
//   //         );
//   //         break;
//   //       default:
//   //         break;
//   //     }
//   //   }
//   //   console.log("FLIGHTS vers FlightCard :", filtered.length, "vols");

//   //   // eslint-disable-next-line react-hooks/set-state-in-effect
//   //   setFilteredFlights(filtered);
//   // }, [flights, priceRange, stops, selectedAirlines, sortBy, loading]);

//   // Liste des compagnies uniques pour les filtres
//   // ✅ Vérifie que flights contient bien des objets avec un .airline
//   const uniqueAirlines = Array.from(new Set(flights.map((f) => f.airline)));

//   // Récupération du nom de la ville (ex: "Yaoundé") à partir des aéroports
//   const originCity = airports.find((a) => a.code === origin)?.city || origin;
//   const destinationCity =
//     airports.find((a) => a.code === destination)?.city || destination;

//   // 💡 Option : vérifier si origin et destination correspondent bien à des codes existants
//   //   sinon tu peux afficher un message "ville inconnue" ou rediriger.

//   // ---------- ÉCRANS SPÉCIAUX (LOADING / ERROR) ----------
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600">Chargement des vols…</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600">
//             Impossible de charger les vols. Réessayez plus tard.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ---------- COMPOSANT PRINCIPAL ----------
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* En-tête avec bouton retour */}
//       <Header showBackButton={true} />

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Résumé de la recherche */}
//         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//           <h2 className="text-2xl font-bold mb-2">
//             {originCity} → {destinationCity}
//           </h2>
//           <p className="text-gray-600">
//             {new Date(date).toLocaleDateString("fr-FR", {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}{" "}
//             · {passengers} {passengers === "1" ? "passager" : "passagers"}
//           </p>
//           <p className="text-sm text-gray-500 mt-2">
//             <span>{filteredFlights.length}</span> vol
//             {filteredFlights.length > 1 ? "s" : ""} trouvé
//             {filteredFlights.length > 1 ? "s" : ""}
//           </p>

//           {/* <p className="text-sm text-gray-500 mt-2">
//             {filteredFlights.length} vol
//             {filteredFlights.length > 1 ? "s" : ""} trouvé
//             {filteredFlights.length > 1 ? "s" : ""}
//           </p> */}
//         </div>

//         {/* Grille principale : filtres + résultats */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Sidebar de filtres */}
//           <div className="lg:col-span-1">
//             <FilterSidebar
//               maxPrice={maxPrice}
//               priceRange={priceRange}
//               onPriceChange={setPriceRange}
//               stops={stops}
//               onStopsChange={setStops}
//               airlines={uniqueAirlines}
//               selectedAirlines={selectedAirlines}
//               onAirlinesChange={setSelectedAirlines}
//               sortBy={sortBy}
//               onSortChange={setSortBy}
//             />
//           </div>

//           {/* Résultats des vols */}
//           <div className="lg:col-span-3 space-y-4">
//             {filteredFlights.length === 0 && !loading && !error ? (
//               <div className="bg-white rounded-xl shadow-md p-12 text-center">
//                 <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                   Aucun vol trouvé
//                 </h3>
//                 <p className="text-gray-500">
//                   Essayez de modifier vos filtres ou vos critères de recherche
//                 </p>
//               </div>
//             ) : (
//               filteredFlights.map((flight) => (
//                 <FlightCard key={flight.id} flight={flight} />
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Footer global */}
//       <Footer />
//     </div>
//   );
// }

// // import { useState, useEffect } from "react";
// // import { useSearchParams } from "react-router-dom";
// // import { FlightCard } from "../features/FlightResult/components/FlightCard";
// // import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
// // import { Header } from "../composants/shared/Header";
// // import { Footer } from "../composants/shared/Footer";
// // import { airports } from "../data/mockFlights";
// // import { Plane } from "lucide-react";

// // /**
// //  * Fonction utilitaire qui transforme un vol d'AvionStack (ou API externe)
// //  * vers le format attendu par FlightCard (prix, durée, horaires, etc.)
// //  */
// // function mapApiFlightToCard(flightItem, index) {
// //   // On crée une date de base aujourd'hui (pour le contexte général)
// //   // const now = new Date();

// //   // Heure de départ et d’arrivée des vols
// //   const dep = new Date(flightItem.departure.scheduled);
// //   const arr = new Date(flightItem.arrival.scheduled);

// //   // Calcul de la durée en minutes, puis conversion en h + min
// //   const durationMinutes = Math.round((arr - dep) / 60000);
// //   const durationHours = Math.floor(durationMinutes / 60);
// //   const durationMin = durationMinutes % 60;

// //   return {
// //     id: `api-${index}`,                      // clé unique pour React
// //     flight: flightItem.flight,              // numéro de vol
// //     airline: flightItem.airline,            // compagnie
// //     airlineCode: flightItem.flight.split(/(\d+)/)[0], // extrait le code compagnie
// //     // À terme, le prix viendra de l’API (ou d’un calcul réaliste côté backend)
// //     price: 199 + Math.floor(Math.random() * 400),
// //     stops: 0,                               // on considère "direct" ici
// //     duration: `${durationHours}h ${durationMin}min`,
// //     departureTime: dep.toTimeString().slice(0, 5),   // format HH:MM
// //     arrivalTime: arr.toTimeString().slice(0, 5),     // format HH:MM
// //     departureAirport: flightItem.departure.airport,
// //     arrivalAirport: flightItem.arrival.airport,
// //     departureTerminal: flightItem.departure.terminal,
// //     arrivalTerminal: flightItem.arrival.terminal,
// //     status: flightItem.status,
// //   };
// // }

// // /**
// //  * Écran des résultats de recherche de vols
// //  * - Récupère les params depuis l’URL (origin, destination, date, etc.)
// //  * - Appelle /api/flights/search via fetch
// //  * - Gère loading / error
// //  * - Filtre et trie les vols côté client
// //  */
// // export function Results() {
// //   // Lecture des paramètres de recherche dans l’URL (via ?origin=...&destination=...&date=...)
// //   const [searchParams] = useSearchParams();

// //   // Extraction des valeurs de recherche
// //   const origin = searchParams.get("origin") || "";
// //   const destination = searchParams.get("destination") || "";
// //   const date = searchParams.get("date") || "";
// //   const passengers = searchParams.get("passengers") || "1";
// //   const tripType = searchParams.get("tripType") || "one-way";
// //   const returnDate = searchParams.get("returnDate") || null;

// //   // ---------- ÉTAT PRINCIPAL DES VOLS ----------
// //   const [flights, setFlights] = useState([]);         // vols “bruts” mappés pour FlightCard
// //   const [loading, setLoading] = useState(true);       // indique que l’API charge
// //   const [error, setError] = useState(false);          // erreur réseau ou API

// //   // ---------- FILTRES ET TRI ----------
// //   const [filteredFlights, setFilteredFlights] = useState([]);
// //   const [priceRange, setPriceRange] = useState([0, 1000]); // plage de prix actuelle
// //   const [maxPrice, setMaxPrice] = useState(1000);          // prix max trouvé dans cette recherche
// //   const [stops, setStops] = useState("all");               // "all" | "direct" | "1-stop"
// //   const [selectedAirlines, setSelectedAirlines] = useState([]);
// //   const [sortBy, setSortBy] = useState("price-asc");       // tri actuel

// //   // ---------- RÉCUPÉRATION DES VOL VIA L’API BACKEND ----------
// //   useEffect(() => {
// //     // Si les champs obligatoires manquent, on ne lance pas la recherche
// //     if (!origin || !destination || !date) return;

// //     // Indique le début du chargement
// //     // eslint-disable-next-line react-hooks/set-state-in-effect
// //     setLoading(true);
// //     setError(false);

// //     // Construction des paramètres de l’URL
// //     const params = new URLSearchParams({
// //       origin,
// //       destination,
// //       departureDate: date,
// //       passengers,
// //       tripType,
// //     });

// //     // Si vol aller-retour, on ajoute returnDate
// //     if (tripType === "round-trip" && returnDate) {
// //       params.append("returnDate", returnDate);
// //     }

// //     // Appel de ton backend
// //     fetch(`/api/flights/search?${params}`)
// //       .then((res) => {
// //         if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //         return res.json();
// //       })
// //       .then((data) => {
// //         // On mape chaque vol de departureFlights vers le format de FlightCard
// //         const mapped = data.departureFlights.map((f, i) => mapApiFlightToCard(f, i));
// //         setFlights(mapped);

// //         // Calcul du prix max pour ajuster le slider/filtre
// //         const max = Math.max(0, ...mapped.map((f) => f.price));
// //         setMaxPrice(max);
// //         setPriceRange([0, max]);

// //         setLoading(false);
// //       })
// //       .catch((err) => {
// //         console.error("Erreur lors de la requête des vols :", err);
// //         setError(true);
// //         setLoading(false);
// //       });
// //   }, [origin, destination, date, passengers, tripType, returnDate]);

// //   // ---------- FILTRES ET TRI (appliqués à chaque changement d’état) ----------
// //   useEffect(() => {
// //     let filtered = [...flights];

// //     // Si on est encore en chargement ou qu’il n’y a aucun vol, on ne filtre pas
// //     if (!loading && flights.length > 0) {
// //       // Filtre par prix
// //       filtered = filtered.filter(
// //         (f) => f.price >= priceRange[0] && f.price <= priceRange[1]
// //       );

// //       // Filtre par escales
// //       if (stops === "direct") {
// //         filtered = filtered.filter((f) => f.stops === 0);
// //       } else if (stops === "1-stop") {
// //         filtered = filtered.filter((f) => f.stops <= 1); // 0 ou 1 escale
// //       } // autres cas ("all") laissent tout passer

// //       // Filtre par compagnie
// //       if (selectedAirlines.length > 0) {
// //         filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
// //       }

// //       // Tri
// //       switch (sortBy) {
// //         case "price-asc":
// //           filtered.sort((a, b) => a.price - b.price);
// //           break;
// //         case "price-desc":
// //           filtered.sort((a, b) => b.price - a.price);
// //           break;
// //         case "duration-asc":
// //           filtered.sort((a, b) => {
// //             const durationA = parseInt(a.duration.split("h")[0]);
// //             const durationB = parseInt(b.duration.split("h")[0]);
// //             return durationA - durationB;
// //           });
// //           break;
// //         case "departure-asc":
// //           filtered.sort((a, b) =>
// //             a.departureTime.localeCompare(b.departureTime)
// //           );
// //           break;
// //         case "departure-desc":
// //           filtered.sort((a, b) =>
// //             b.departureTime.localeCompare(a.departureTime)
// //           );
// //           break;
// //         default:
// //           break;
// //       }
// //     }

// //     // eslint-disable-next-line react-hooks/set-state-in-effect
// //     setFilteredFlights(filtered);
// //   }, [flights, priceRange, stops, selectedAirlines, sortBy, loading]);

// //   // Liste des compagnies uniques pour les filtres
// //   const uniqueAirlines = Array
// // .from(new Set(flights.map((f) => f.airline)));

// //   // Récupération du nom de la ville (ex: "Yaoundé") à partir des aéroports
// //   const originCity = airports.find((a) => a.code === origin)?.city || origin;
// //   const destinationCity =
// //     airports.find((a) => a.code === destination)?.city || destination;

// //   // ---------- ÉCRANS SPÉCIAUX (LOADING / ERROR) ----------
// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //           <p className="text-gray-600">Chargement des vols…</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <p className="text-red-600">
// //             Impossible de charger les vols. Réessayez plus tard.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ---------- COMPOSANT PRINCIPAL ----------
// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* En-tête avec bouton retour */}
// //       <Header showBackButton={true} />

// //       <div className="max-w-7xl mx-auto px-4 py-8">
// //         {/* Résumé de la recherche */}
// //         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
// //           <h2 className="text-2xl font-bold mb-2">
// //             {originCity} → {destinationCity}
// //           </h2>
// //           <p className="text-gray-600">
// //             {new Date(date).toLocaleDateString("fr-FR", {
// //               weekday: "long",
// //               year: "numeric",
// //               month: "long",
// //               day: "numeric",
// //             })}{" "}
// //             · {passengers} {passengers === "1" ? "passager" : "passagers"}
// //           </p>
// //           <p className="text-sm text-gray-500 mt-2">
// //             {filteredFlights.length} vol
// //             {filteredFlights.length > 1 ? "s" : ""} trouvé
// //             {filteredFlights.length > 1 ? "s" : ""}
// //           </p>
// //         </div>

// //         {/* Grille principale : filtres + résultats */}
// //         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //           {/* Sidebar de filtres */}
// //           <div className="lg:col-span-1">
// //             <FilterSidebar
// //               maxPrice={maxPrice}
// //               priceRange={priceRange}
// //               onPriceChange={setPriceRange}
// //               stops={stops}
// //               onStopsChange={setStops}
// //               airlines={uniqueAirlines}
// //               selectedAirlines={selectedAirlines}
// //               onAirlinesChange={setSelectedAirlines}
// //               sortBy={sortBy}
// //               onSortChange={setSortBy}
// //             />
// //           </div>

// //           {/* Résultats des vols */}
// //           <div className="lg:col-span-3 space-y-4">
// //             {filteredFlights.length === 0 ? (
// //               <div className="bg-white rounded-xl shadow-md p-12 text-center">
// //                 <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //                 <h3 className="text-xl font-semibold text-gray-700 mb-2">
// //                   Aucun vol trouvé
// //                 </h3>
// //                 <p className="text-gray-500">
// //                   Essayez de modifier vos filtres ou vos critères de recherche
// //                 </p>
// //               </div>
// //             ) : (
// //               filteredFlights.map((flight) => (
// //                 <FlightCard key={flight.id} flight={flight} />
// //               ))
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Footer global */}
// //       <Footer />
// //     </div>
// //   );
// // }
