// Import des icônes nécessaires depuis lucide-react
// - Plane: avion (pour la ligne de vol)
// - Clock: horloge (pour afficher l'avion/cabine)
// - MapPin: épingle (pour afficher la classe de cabine)
// - Heart: cœur (pour le bouton favori)
import { Plane, Clock, MapPin, Heart } from "lucide-react";

// Import de useNavigate pour la navigation entre les pages
// Permet de rediriger vers la page de détail du vol
import { useNavigate } from "react-router-dom";

// Import de useState pour gérer l'état local du composant
// Nécessaire pour le bouton favori (favori ou non)
import { useState, useEffect } from "react";
import { useLocale } from "../../../contexts/LocaleContext.jsx";

import { toggleFavorite, getFavorites } from "../../../utils/favoritesStorage";

// Définition du composant FlightCard qui reçoit un objet `flight` comme prop
export function FlightCard({ flight }) {
  // Affiche dans la console le vol reçu (utile pour le débogage)
  console.log("FLIGHT RECU PAR FlightCard :", flight);
  // c'est pour la gestion des favoris, on peut supprimer ce console.log après les tests
  const [isFavorite, setIsFavorite] = useState(false);
  const {
    currency: selectedCurrency,
    convertPrice,
    formatPrice,
    t,
  } = useLocale();

  // [FUSION] useEffect async : on essaie d'abord de lire depuis la BD, sinon on utilise localStorage
  useEffect(() => {
    const loadFavorite = async () => {
      const token = localStorage.getItem('token');
      // eslint-disable-next-line no-useless-assignment
      let exists = false;

      if (token) {
        // Essayer de lire depuis la BD
        try {
          const favorites = await getFavorites(); // ← retourne un tableau d'objets { id } depuis la BD
          exists = favorites.some((item) => item.id === flight.id);
        } catch {
          // Si l'API échoue, utiliser localStorage comme fallback
          // eslint-disable-next-line react-hooks/immutability
          const favorites = getFavoritesLocalStorage();
          exists = favorites.some((item) => item.id === flight.id);
        }
      } else {
        // Pas de token → utiliser localStorage
        const favorites = getFavoritesLocalStorage();
        exists = favorites.some((item) => item.id === flight.id);
      }

      setIsFavorite(exists);
    };
    loadFavorite();
  }, [flight.id]);

  // [FUSION] handleFavoriteClick async : on essaie de synchroniser avec la BD, sinon on utilise localStorage
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    // ajout fait pour le test, de la touche 🤍
    const currentUser = localStorage.getItem("currentUser");
    const user = currentUser ? JSON.parse(currentUser) : null;

    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          flightToSave: flight,
          message: "Connecte-toi pour ajouter ce vol aux favoris.",
        },
      });
      return;
    }

    const token = localStorage.getItem('token');
    let updated;

    if (token) {
      // Essayer de synchroniser avec la BD
      try {
        // On passe un objet complet avec les données de recherche
  updated = await toggleFavorite({
    id: flight.id,
    vol_id: flight.id,
    origin: flight.origin,
    destination: flight.destination,
    price: flight.price}) // ← ajoute/supprime dans la BD
      } catch {
        // Si l'API échoue, utiliser localStorage comme fallback
        updated = toggleFavoriteLocalStorage(flight);
      }
    } else {
      // Pas de token → utiliser localStorage
      updated = toggleFavoriteLocalStorage(flight);
    }

    // On recalcule isFavorite à partir du résultat retourné
    const exists = updated.some((item) => item.id === flight.id);
    setIsFavorite(exists);
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

  // Initialisation de la fonction de navigation fournie par React Router
  const navigate = useNavigate();

   // Début du rendu du composant
  return (
    // Conteneur principal du card : fond blanc, coins arrondis, ombre qui grossit au survol
    <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      {/* En-tête du card : nom de la compagnie et prix */}
      <div className="flex items-start justify-between mb-4">
        {/* Partie gauche : nom de la compagnie et numéro de vol */}
        <div>
          {/* Nom de la compagnie aérienne */}
          <h3 className="font-semibold text-lg">{flight.airline}</h3>
          {/* Numéro du vol (ex: AF123) */}
          <p className="text-sm text-gray-500">{flight.flightNumber}</p>
        </div>

        {/* Partie droite : prix et info "par passager" */}
        <div className="text-right">
          <p className="text-xs text-gray-500">{t("from")}</p>{" "}
          <p className="text-3xl font-bold text-blue-600">
            {flight.price
              ? formatPrice(
                  convertPrice(
                    flight.price,
                    flight.currency || "EUR",
                    selectedCurrency,
                  ),
                  selectedCurrency,
                )
              : t("noFlightsFound")}
          </p>
        </div>

        {/* <div className="text-right">
        {/* prix en fonction de la devise et info "par passager" */}
        {/* <p className="text-3xl font-bold text-blue-600">
            {flight.price ?? "N/A"} {flight.currency ?? "EUR"}
          </p>
          {/* Petite info sous le prix */}
        {/* <p className="text-xs text-gray-500">par passager</p>
        </div> */}
      </div>

      {/* Section centrale : horaires de départ et d'arrivée + durée/escales */}
      <div className="flex items-center justify-between mb-4">
        {/* Partie gauche : heure et lieu de départ */}
        <div className="flex-1">
          {/* Heure de départ (ex: 08:30) */}
          <p className="text-2xl font-semibold">{flight.departureTime}</p>
          {/* Code ou nom de l'aéroport de départ (ex: Paris CDG) */}
          <p className="text-sm text-gray-600">{flight.origin}</p>
        </div>

        {/* Partie centrale : durée du vol, ligne de vol avec avion, nombre d'escales */}
        <div className="flex-1 flex flex-col items-center px-4">
          {/* Durée du vol (ex: 2h30) */}
          <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>

          {/* Ligne horizontale avec un avion au milieu */}
          <div className="w-full flex items-center gap-1">
            {/* Trait pointillé à gauche */}
            <div className="h-px bg-gray-300 flex-1"></div>
            {/* Icône avion tournée verticalement */}
            <Plane className="w-4 h-4 text-gray-400 rotate-90" />
            {/* Trait pointillé à droite */}
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Texte indiquant "Direct" ou "1 escale"/"2 escales" */}
          <p className="text-xs text-gray-500 mt-1">
            {flight.stops === 0
              ? t("direct")
              : `${flight.stops} ${flight.stops > 1 ? t("stops") : t("stop")}`}
          </p>
        </div>

        {/* Partie droite : heure et lieu d'arrivée */}
        <div className="flex-1 text-right">
          {/* Heure d'arrivée (ex: 11:00) */}
          <p className="text-2xl font-semibold">{flight.arrivalTime}</p>
          {/* Code ou nom de l'aéroport d'arrivée (ex: New York JFK) */}
          <p className="text-sm text-gray-600">{flight.destination}</p>
        </div>
      </div>

      {/* Section du bas : infos supplémentaires (avion, cabine) + bouton Sélectionner */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* Partie gauche : infos sur l'avion et la classe de cabine */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {/* Type d'avion (ex: Boeing 737) avec icône horloge */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{flight.aircraft}</span>
          </div>
          {/* Classe de cabine (ex: Économique) avec icône épingle */}
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{flight.cabinClass}</span>
          </div>
        </div>

        {/* Bouton pour sélectionner ce vol et aller vers la page de détail */}
        <button
          onClick={() => {
            navigate(
              `/flight/${flight.id}${flight.date ? `?date=${flight.date}` : ""}`,
            );
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("select")}
        </button>
      </div>

      {/* Bouton Favori (NOUVELLE FONCTIONNALITÉ) */}

      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Ajouter aux favoris"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </button>

      {/* Remplacer l'ancien bloc {flight.availableSeats < 20 && ...} par ceci : */}
      {/* Si le nombre de places disponibles est inférieur à 20, afficher un message orange */}
      {flight.availableSeats < 20 ? (
        <div className="block mt-2">
          <span className="text-xs text-orange-600">
            {t("seatsLeft", { count: String(flight.availableSeats) })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
