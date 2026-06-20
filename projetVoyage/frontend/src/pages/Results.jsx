import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FlightCard } from "../features/FlightResult/components/FlightCard";
import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { airports } from "../data/mockFlights";
import { Plane } from "lucide-react";
import { getFavorites, toggleFavorite } from "../utils/favoritesStorage"; // Adaptez le chemin relatif


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


  // Stocke uniquement les chaînes d'IDs favoris (ex: ["JFK-BCN-2026-06-18-0"])
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [currentUser] = useState(() => JSON.parse(localStorage.getItem("currentUser")));

  // Charger les favoris de l'utilisateur connecté dès l'affichage des résultats
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (!currentUser) return; // Si pas connecté, on ignore la BDD
      try {
        const favs = await getFavorites();
        // Extrait uniquement les IDs sous forme de tableau de chaînes de caractères
        const ids = (favs || []).map(f => f.id || f);
        setFavoriteIds(ids);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris dans Result.jsx:", error);
      }
    };

    loadUserFavorites();
  }, [currentUser]);

  // Fonction déclenchée lors du clic sur l'icône favori d'un vol
  const handleToggleFavorite = async (flight) => {
    try {
      // 1. Appel asynchrone de la fonction hybride (BDD ou LocalStorage)
      const updatedFavorites = await toggleFavorite(flight);
      
      // 2. Extrait les nouveaux IDs pour mettre à jour l'affichage
      const newIds = (updatedFavorites || []).map(f => f.id || f);
      setFavoriteIds(newIds);
      
    } catch (error) {
      console.error("Erreur lors du switch favori dans Result.jsx:", error);
    }
  };
  

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
              // filteredFlights.map((flight) => (
              //   <FlightCard key={flight.id} flight={flight} />
              // )
              filteredFlights.map((flight) => {
                // 🔍 On vérifie si ce vol est actuellement dans les favoris
                const isCurrentFlightFavorite = favoriteIds.includes(flight.id);

                return (
                  <FlightCard 
                    key={flight.id} 
                    flight={flight} 
                    // ➕ On transmet les nouvelles propriétés au composant enfant
                    isFavorite={isCurrentFlightFavorite}
                    onToggleFavorite={() => handleToggleFavorite(flight)}
                  />
                );
              })
            )}
            
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
