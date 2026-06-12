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

import { toggleFavorite, getFavorites } from "../../../utils/favoritesStorage";

// Définition du composant FlightCard qui reçoit un objet `flight` comme prop
export function FlightCard({ flight }) {
  // Affiche dans la console le vol reçu (utile pour le débogage)
  console.log("FLIGHT RECU PAR FlightCard :", flight);
  // c'est pour la gestion des favoris, on peut supprimer ce console.log après les tests
  const [isFavorite, setIsFavorite] = useState(false);


  useEffect(() => {
    const favorites = getFavorites();
    const exists = favorites.some((item) => item.id === flight.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorite(exists);
  }, [flight.id]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(flight);
    setIsFavorite((prev) => !prev);
  };

  // Initialisation de la fonction de navigation fournie par React Router
  const navigate = useNavigate();

  // État local pour savoir si le vol est marqué comme favori
  // false = pas favori, true = favori
  
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
          <p className="text-xs text-gray-500">À partir de</p>{" "}
          {/* Changement ici */}
          <p className="text-3xl font-bold text-blue-600">
            {flight.price ? `${flight.price} ${flight.currency}` : "Non dispo."}
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
              ? "Direct"
              : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
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
            navigate(`/flight/${flight.id}${flight.date ? `?date=${flight.date}` : ""}`);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sélectionner
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
            {/* Convertir en chaîne pour éviter les problèmes de type */}
            Plus que {String(flight.availableSeats)} places disponibles
          </span>
        </div>
      ) : null}
    </div>
  );
}
