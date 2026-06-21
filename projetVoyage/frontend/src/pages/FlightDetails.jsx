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
  // useEffect(() => {
  //   if (flight) {
  //     const favorites = getFavorites();

  //     const isFavorite =
  //       Array.isArray(favorites) &&
  //       favorites.some((fav) => fav.id === flight.id);

  //     // const exists = favorites.some((item) => item.id === flight.id);
  //     // eslint-disable-next-line react-hooks/set-state-in-effect
  //     setIsFavorite(isFavorite);
  //   }
  // }, [flight]);

  //   useEffect(() => {
  //   if (!flight) return; // Sécurité : on ne fait rien si le vol n'est pas encore chargé

  //   // On récupère directement la liste partagée par TOUS les composants
  //   const savedFavorites = localStorage.getItem("favoriteFlights");
  //   const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

  //   // Vérification
  //   const isFav = Array.isArray(favorites) && favorites.some((fav) => fav.id === flight.id);

  //   // Mise à jour de l'état (sans alerte ESLint)
  //   // eslint-disable-next-line react-hooks/set-state-in-effect
  //   setIsFavorite(isFav);
  // }, [flight]);

    // Effet pour vérifier si le vol est favori au chargement initial
  useEffect(() => {
    if (!flight) return;

    // Déclaration d'une fonction interne asynchrone
    const checkFavoriteStatus = async () => {
      try {
        // 1. Attendre la réponse de l'API ou du localStorage
        const favorites = await getFavorites(); 
        
        // 2. Vérifier si le vol actuel est dans la liste
        const isFav = Array.isArray(favorites) && favorites.some((fav) => fav.id === flight.id);
        
        // 3. Mettre à jour l'état visuel (L'alerte ESLint va disparaître ici)
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Erreur lors de la vérification du favori :", err);
        
        // En cas d'erreur totale, repli de secours synchrone direct sur le localStorage
        const saved = JSON.parse(localStorage.getItem("favoriteFlights") || "[]");
        setIsFavorite(saved.some(fav => fav.id === flight.id));
      }
    };

    checkFavoriteStatus();
  }, [flight]); // S'exécute dès que le vol est disponible


  // État pour gérer l'affichage du message temporaire
const [toastMessage, setToastMessage] = useState("");



  // Fonction pour gérer le clic favori
  // const handleFavoriteClick = (e) => {
  //   e.stopPropagation();
  //   toggleFavorite(flight);
  //   setIsFavorite((prev) => !prev);
  // };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    const currentUser = localStorage.getItem("currentUser");
    const user = currentUser ? JSON.parse(currentUser) : null;

    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          flightToSave: flight, // Fonctionnera parfaitement car 'flight' existe dans votre état local
          message: "Connecte-toi pour ajouter ce vol aux favoris.",
        },
      });
      return;
    }

    const token = localStorage.getItem("token");
    let updated;

    if (token) {
      try {
        // CORRECTION ICI : Assurez-vous que les propriétés de l'objet 'flight'
        // correspondent bien à la structure de vos données dans FlightDetails
        updated = await toggleFavorite({
          id: flight.id,
          vol_id: flight.id,
          origin: flight.origin,
          destination: flight.destination,
          price: flight.price,
        });
      } catch {
        updated = toggleFavoriteLocalStorage(flight);
      }
    } else {
      updated = toggleFavoriteLocalStorage(flight);
    }

    // Piège évité : 'updated' doit être un tableau pour que '.some' fonctionne
    if (Array.isArray(updated)) {
      const exists = updated.some((item) => item.id === flight.id);
      setIsFavorite(exists);
          // ... (votre code précédent pour ajouter le favori) ...

    if (Array.isArray(updated)) {
      const exists = updated.some((item) => item.id === flight.id);
      setIsFavorite(exists);

      // AJOUT : Si le vol vient d'être ajouté (il existe maintenant dans les favoris)
      if (exists) {
        setToastMessage("Vol ajouté à vos favoris ❤ et dans vos alertes de prix 🔔 ! ");
        
        // Disparaît automatiquement après 3 secondes (3000 ms)
        setTimeout(() => {
          setToastMessage("");
        }, 10000);
      } else {
        // Optionnel : message si l'utilisateur le supprime des favoris
        setToastMessage("Vol retiré de vos favoris ❤ et dans vos alertes de prix 🔔.");
        setTimeout(() => {
          setToastMessage("");
        }, 10000);
      }
    }

    }
  };
  // Helper : lire favoris depuis localStorage (fallback)
  const getFavoritesLocalStorage = () => {
    const favorites = localStorage.getItem("favoriteFlights");
    return favorites ? JSON.parse(favorites) : [];
  };

  // Helper : ajouter/supprimer favoris dans localStorage (fallback)
  const toggleFavoriteLocalStorage = (flight) => {
    const favorites = getFavoritesLocalStorage();
    const exists = favorites.some((item) => item.id === flight.id);

    let updatedFavorites;
    if (exists) {
      updatedFavorites = favorites.filter((item) => item.id !== flight.id);
    } else {
      updatedFavorites = [...favorites, flight];
    }

    localStorage.setItem("favoriteFlights", JSON.stringify(updatedFavorites));
    return updatedFavorites;
  };

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
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-up">
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
