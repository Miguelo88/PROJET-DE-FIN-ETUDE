import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FlightCard } from "../features/FlightResult/components/FlightCard";
import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { airports } from "../data/mockFlights";
import { Plane } from "lucide-react";

/**
 * Fonction utilitaire qui transforme un vol d'AvionStack (ou API externe)
 * vers le format attendu par FlightCard (prix, durée, horaires, etc.)
 */
function mapApiFlightToCard(flightItem, index) {
  // On crée une date de base aujourd'hui (pour le contexte général)
  // const now = new Date();

  // Heure de départ et d’arrivée des vols
  const dep = new Date(flightItem.departure.scheduled);
  const arr = new Date(flightItem.arrival.scheduled);

  // Calcul de la durée en minutes, puis conversion en h + min
  const durationMinutes = Math.round((arr - dep) / 60000);
  const durationHours = Math.floor(durationMinutes / 60);
  const durationMin = durationMinutes % 60;

  return {
    id: `api-${index}`,                      // clé unique pour React
    flight: flightItem.flight,              // numéro de vol
    airline: flightItem.airline,            // compagnie
    airlineCode: flightItem.flight.split(/(\d+)/)[0], // extrait le code compagnie
    // À terme, le prix viendra de l’API (ou d’un calcul réaliste côté backend)
    price: 199 + Math.floor(Math.random() * 400),
    stops: 0,                               // on considère "direct" ici
    duration: `${durationHours}h ${durationMin}min`,
    departureTime: dep.toTimeString().slice(0, 5),   // format HH:MM
    arrivalTime: arr.toTimeString().slice(0, 5),     // format HH:MM
    departureAirport: flightItem.departure.airport,
    arrivalAirport: flightItem.arrival.airport,
    departureTerminal: flightItem.departure.terminal,
    arrivalTerminal: flightItem.arrival.terminal,
    status: flightItem.status,
  };
}

/**
 * Écran des résultats de recherche de vols
 * - Récupère les params depuis l’URL (origin, destination, date, etc.)
 * - Appelle /api/flights/search via fetch
 * - Gère loading / error
 * - Filtre et trie les vols côté client
 */
export function Results() {
  // Lecture des paramètres de recherche dans l’URL (via ?origin=...&destination=...&date=...)
  const [searchParams] = useSearchParams();

  // Extraction des valeurs de recherche
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";
  const tripType = searchParams.get("tripType") || "one-way";
  const returnDate = searchParams.get("returnDate") || null;

  // ---------- ÉTAT PRINCIPAL DES VOLS ----------
  const [flights, setFlights] = useState([]);         // vols “bruts” mappés pour FlightCard
  const [loading, setLoading] = useState(true);       // indique que l’API charge
  const [error, setError] = useState(false);          // erreur réseau ou API

  // ---------- FILTRES ET TRI ----------
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]); // plage de prix actuelle
  const [maxPrice, setMaxPrice] = useState(1000);          // prix max trouvé dans cette recherche
  const [stops, setStops] = useState("all");               // "all" | "direct" | "1-stop"
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");       // tri actuel

  // ---------- RÉCUPÉRATION DES VOL VIA L’API BACKEND ----------
  useEffect(() => {
    // Si les champs obligatoires manquent, on ne lance pas la recherche
    if (!origin || !destination || !date) return;

    // Indique le début du chargement
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(false);

    // Construction des paramètres de l’URL
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: date,
      passengers,
      tripType,
    });

    // Si vol aller-retour, on ajoute returnDate
    if (tripType === "round-trip" && returnDate) {
      params.append("returnDate", returnDate);
    }

    // Appel de ton backend
    fetch(`/api/flights/search?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // On mape chaque vol de departureFlights vers le format de FlightCard
        const mapped = data.departureFlights.map((f, i) => mapApiFlightToCard(f, i));
        setFlights(mapped);

        // Calcul du prix max pour ajuster le slider/filtre
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

  // ---------- FILTRES ET TRI (appliqués à chaque changement d’état) ----------
  useEffect(() => {
    let filtered = [...flights];

    // Si on est encore en chargement ou qu’il n’y a aucun vol, on ne filtre pas
    if (!loading && flights.length > 0) {
      // Filtre par prix
      filtered = filtered.filter(
        (f) => f.price >= priceRange[0] && f.price <= priceRange[1]
      );

      // Filtre par escales
      if (stops === "direct") {
        filtered = filtered.filter((f) => f.stops === 0);
      } else if (stops === "1-stop") {
        filtered = filtered.filter((f) => f.stops <= 1); // 0 ou 1 escale
      } // autres cas ("all") laissent tout passer

      // Filtre par compagnie
      if (selectedAirlines.length > 0) {
        filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
      }

      // Tri
      switch (sortBy) {
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "duration-asc":
          filtered.sort((a, b) => {
            const durationA = parseInt(a.duration.split("h")[0]);
            const durationB = parseInt(b.duration.split("h")[0]);
            return durationA - durationB;
          });
          break;
        case "departure-asc":
          filtered.sort((a, b) =>
            a.departureTime.localeCompare(b.departureTime)
          );
          break;
        case "departure-desc":
          filtered.sort((a, b) =>
            b.departureTime.localeCompare(a.departureTime)
          );
          break;
        default:
          break;
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredFlights(filtered);
  }, [flights, priceRange, stops, selectedAirlines, sortBy, loading]);

  // Liste des compagnies uniques pour les filtres
  const uniqueAirlines = Array
.from(new Set(flights.map((f) => f.airline)));

  // Récupération du nom de la ville (ex: "Yaoundé") à partir des aéroports  const originCity = airports.find((a) => a.code === origin)?.city || origin;
  const destinationCity =
    airports.find((a) => a.code === destination)?.city || destination;

  // ---------- ÉCRANS SPÉCIAUX (LOADING / ERROR) ----------
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

  // ---------- COMPOSANT PRINCIPAL ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec bouton retour */}
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Résumé de la recherche */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            // eslint-disable-next-line no-undef, no-undef
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

        {/* Grille principale : filtres + résultats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtres */}
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

          {/* Résultats des vols */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFlights.length === 0 ? (
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

      {/* Footer global */}
      <Footer />
    </div>
  );
}