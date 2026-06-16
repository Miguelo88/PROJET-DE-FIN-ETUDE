import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { Plane, Clock, Users, MapPin, Calendar, Heart } from "lucide-react";
import { toggleFavorite, getFavorites } from "../utils/favoritesStorage";

export function FlightDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // État pour le favori
  const [isFavorite, setIsFavorite] = useState(false);

  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  // Effet pour charger le vol
  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("ID de vol manquant");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const searchResults = JSON.parse(
      localStorage.getItem("searchResults") || "[]",
    );

    const exactMatch = searchResults.find((f) => f.id === id);

    if (exactMatch) {
      setFlight(exactMatch);
      setLoading(false);
      return;
    }

    const lastDashIndex = id.lastIndexOf("-");
    const simpleId = lastDashIndex > -1 ? id.substring(lastDashIndex + 1) : id;

    const foundFlight = searchResults.find((f) => f.id === simpleId);

    if (foundFlight) {
      setFlight(foundFlight);
    } else {
      const foundByComplexId = searchResults.find(
        (f) => `${f.origin}-${f.destination}-${date}-${f.id}` === id,
      );

      if (foundByComplexId) {
        setFlight(foundByComplexId);
      } else {
        setError("Vol non trouvé. Veuillez recommencer la recherche.");
      }
    }

    setLoading(false);
  }, [id, date]);

  // Effet pour vérifier si le vol est favori
  useEffect(() => {
    if (flight) {
      const favorites = getFavorites();
      const exists = favorites.some((item) => item.id === flight.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFavorite(exists);
    }
  }, [flight]);

  // Fonction pour gérer le clic favori
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(flight);
    setIsFavorite((prev) => !prev);
  };

  // const normalizeBookingLink = (link) => {
  //   if (!link || typeof link !== "string") {
  //     return null;
  //   }

  //   const trimmedLink = link.trim();
  //   if (/^https?:\/\//i.test(trimmedLink)) {
  //     return trimmedLink;
  //   }

  //   return `https://${trimmedLink.replace(/^\/+/, "")}`;
  // };

  // const handleBookClick = () => {
  //   const url = normalizeBookingLink(flight?.bookingLink);
  //   if (!url) {
  //     window.alert(
  //       "Lien de réservation non disponible ou invalide pour ce vol.",
  //     );
  //     return;
  //   }

  //   window.open(url, "_blank", "noopener,noreferrer");
  // };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement du vol...</p>
        </div>
      </div>
    );
  }

  // Erreur ou vol non trouvé
  if (error || !flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Vol non trouvé
          </h2>
          <p className="text-gray-600 mb-4">{error || "ID de vol invalide"}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline"
          >
            Retour aux résultats
          </button>
        </div>
      </div>
    );
  }

  const originAirport = {
    city: flight.originCity || flight.origin,
    name: flight.originName || flight.origin,
  };
  const destinationAirport = {
    city: flight.destinationCity || flight.destination,
    name: flight.destinationName || flight.destination,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Carte récapitulative du vol avec bouton favori */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 relative">
          {/* Bouton Favori */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Ajouter aux favoris"
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{flight.airline}</h2>
              <p className="text-gray-600">Vol {flight.flightNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">
                {flight.price ?? "N/A"} {flight.currency ?? "EUR"}
              </p>
              <p className="text-sm text-gray-500">par passager</p>
            </div>
          </div>

          {/* Section route du vol */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-4xl font-bold mb-2">
                  {flight.departureTime}
                </p>
                <p className="font-semibold">{originAirport?.city}</p>
                <p className="text-sm text-gray-600">
                  {originAirport?.name} ({flight.origin})
                </p>
              </div>

              <div className="flex-1 flex flex-col items-center px-6">
                <p className="text-sm text-gray-600 mb-2">{flight.duration}</p>
                <div className="w-full flex items-center gap-2">
                  <div className="h-px bg-blue-300 flex-1"></div>
                  <Plane className="w-6 h-6 text-blue-600 rotate-90" />
                  <div className="h-px bg-blue-300 flex-1"></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {flight.stops === 0
                    ? "Vol direct"
                    : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
                </p>
              </div>

              <div className="flex-1 text-right">
                <p className="text-4xl font-bold mb-2">{flight.arrivalTime}</p>
                <p className="font-semibold">{destinationAirport?.city}</p>
                <p className="text-sm text-gray-600">
                  {destinationAirport?.name} ({flight.destination})
                </p>
              </div>
            </div>
          </div>

          {/* Grille d'informations sur le vol */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold">
                  {new Date(date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Durée</p>
                <p className="font-semibold">{flight.duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Classe</p>
                <p className="font-semibold">{flight.cabinClass}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Places restantes</p>
                <p className="font-semibold">
                  {flight.availableSeats || "Non spécifié"}
                </p>
              </div>
            </div>
          </div>

          {/* Informations sur l'appareil */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-3">Informations sur l'appareil</h3>
            <p className="text-gray-600">{flight.aircraft}</p>
          </div>
        </div>

        {/* Rèste du code identique : Détails du tarif, Services inclus, Bouton réservation */}
        {/* ... */}

        {/* Bouton de réservation */}
        {/* {flight.bookingLink ? (
          <a
            href={flight.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Réserver ce vol
          </a>
        ) : (
          <button
            onClick={() =>
              window.alert("Lien de réservation non disponible pour ce vol.")
            }
            className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Réserver ce vol
          </button>
        )} */}

        {flight.bookingLink ? (
          <a
            href={flight.bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
            onClick={(e) => {
              if (!flight.bookingLink) {
                e.preventDefault();
                window.alert("Lien de réservation non disponible pour ce vol.");
              }
            }}
          >
            Réserver ce vol
          </a>
        ) : (
          <button
            onClick={() => {
              const fallbackLink = `https://www.aviasales.com/search/${flight.origin}${date.split("-")[0]}${date.split("-")[1]}${date.split("-")[2]}${flight.destination}1`;
              window.open(fallbackLink, "_blank", "noopener,noreferrer");
            }}
            className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Réserver ce vol
          </button>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Prix final à confirmer lors du paiement
        </p>
      </div>

      <Footer />
    </div>
  );
}
