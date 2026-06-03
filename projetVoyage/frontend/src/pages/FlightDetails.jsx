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
   const handleBookClick = () => {
    // Redirige vers la page de réservation avec l'ID du vol et la date
    navigate(`/reservation/${id}?date=${date}`);
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
                {flight.price}€
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
                <p className="font-semibold">{flight.availableSeats || "Non spécifié"}</p>
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
        <button
          onClick={handleBookClick}
          className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
        >
          Réserver ce vol
        </button>


        <p className="text-center text-sm text-gray-500 mt-4">
          Prix final à confirmer lors du paiement
        </p>
      </div>

      <Footer />
    </div>
  );
}


// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { Header } from "../composants/shared/Header";
// import { Footer } from "../composants/shared/Footer";
// import { Plane, Clock, Users, MapPin, Calendar } from "lucide-react";

// // Si tu as un fichier d' exploiting les codes aéroports (ex: CDG → Paris)
// // Importe-le ici. Sinon, tu peux supprimer ces lignes et utiliser flight.origin/flight.destination directement.
// // import { airports } from "../data/mockFlights";

// export function FlightDetails() {
//   // Récupère l'ID du vol depuis l'URL (/flight/:id)
//   const { id } = useParams();

//   // Récupère les paramètres de requête (?origin=...&destination=...&date=...)
//   const [searchParams] = useSearchParams();

//   // États pour gérer le vol, le chargement et les erreurs
//   const [flight, setFlight] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Pour la navigation (bouton "Retour")
//   const navigate = useNavigate();

//   // Valeurs par défaut si les params manquent (utile en développement)
//   // const origin = searchParams.get("origin") || "CDG";
//   // const destination = searchParams.get("destination") || "JFK";
//   const date =
//     searchParams.get("date") || new Date().toISOString().split("T")[0];

//   // Effet : quand l'ID change, on fetch le vol depuis l'API
//   useEffect(() => {
//     // Si pas d'ID, on ne fait rien
//     if (!id) {
//       setError("ID de vol manquant");
//       setLoading(false);
//       return;
//     }
//     // On réinitialise les états avant de charger
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     setLoading(true);
//     setError(null);

//     // ✅ Récupère les vols depuis localStorage (stockés dans results)
//     const searchResults = JSON.parse(
//       localStorage.getItem("searchResults") || "[]",
//     );

//     // Essaie de trouver le vol par son ID simple (la dernière partie du complexId)
//     const lastDashIndex = id.lastIndexOf("-");
//     const simpleId = lastDashIndex > -1 ? id.substring(lastDashIndex + 1) : id;

//     const foundFlight = searchResults.find((f) => f.id === simpleId);

//     if (foundFlight) {
//       setFlight(foundFlight);
//     } else {
//       // Fallback : chercher par complexId complet
//       const foundByComplexId = searchResults.find(
//         (f) => `${f.origin}-${f.destination}-${date}-${f.id}` === id,
//       );

//       if (foundByComplexId) {
//         setFlight(foundByComplexId);
//       } else {
//         setError("Vol non trouvé. Veuillez recommencer la recherche.");
//       }
//     }

//     setLoading(false);
//   }, [id, date]);

//   // Appel à ton API backend pour récupérer le vol par ID
//   // Remplace `/api/flights/${id}` par ton URL réelle si nécessaire
//   // Exemple: `http://localhost:5000/api/flights/${id}` ou `https://ton-api.com/flights/${id}`
//   //   fetch(`/api/flights/${id}`)
//   //     .then((res) => {
//   //       // Si la réponse n'est pas OK (ex: 404), on lance une erreur
//   //       if (!res.ok) throw new Error("Vol non trouvé");
//   //       return res.json();
//   //     })
//   //     .then((data) => {
//   //       // On stocke le vol reçu dans l'état
//   //       setFlight(data);
//   //       // On arrête le chargement
//   //       setLoading(false);
//   //     })
//   //     .catch((err) => {
//   //       // On stocke le message d'erreur
//   //       setError(err.message);
//   //       // On arrête le chargement
//   //       setLoading(false);
//   //     });
//   // }, [id]); // Cet effet se déclenche à chaque changement de l'ID

//   // État de chargement : afficher un message pendant le fetch
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">Chargement du vol...</p>
//         </div>
//       </div>
//     );
//   }

//   // Erreur ou vol non trouvé : afficher un message d'erreur
//   if (error || !flight) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-700 mb-4">
//             Vol non trouvé
//           </h2>
//           <p className="text-gray-600 mb-4">{error || "ID de vol invalide"}</p>
//           <button
//             onClick={() => navigate(-1)} // Retour à la page précédente
//             className="text-blue-600 hover:underline"
//           >
//             Retour aux résultats
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Si tu utilises toujours `airports` pour les noms de villes, décommente ces lignes
//   // Sinon, tu peux utiliser directement flight.origin et flight.destination
//   // const originAirport = airports.find((a) => a.code === flight.origin);
//   // const destinationAirport = airports.find((a) => a.code === flight.destination);

//   // Pour backward compatibilité, on crée des objets机场 si tu n'as pas encore supprimé `airports`
//   const originAirport = {
//     city: flight.originCity || flight.origin, // Utilise flight.originCity si ton API le renvoie, sinon flight.origin
//     name: flight.originName || flight.origin,
//   };
//   const destinationAirport = {
//     city: flight.destinationCity || flight.destination,
//     name: flight.destinationName || flight.destination,
//   };

//   // Rendu principal de la page de détails du vol
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header avec bouton retour */}
//       <Header showBackButton={true} />

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Carte récapitulative du vol */}
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
//           <div className="flex items-start justify-between mb-6">
//             <div>
//               <h2 className="text-3xl font-bold mb-2">{flight.airline}</h2>
//               <p className="text-gray-600">Vol {flight.flightNumber}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-4xl font-bold text-blue-600">
//                 {flight.price}€
//               </p>
//               <p className="text-sm text-gray-500">par passager</p>
//             </div>
//           </div>

//           {/* Section route du vol (départ → arrivée) */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between">
//               {/* Partie départ */}
//               <div className="flex-1">
//                 <p className="text-4xl font-bold mb-2">
//                   {flight.departureTime}
//                 </p>
//                 <p className="font-semibold">{originAirport?.city}</p>
//                 <p className="text-sm text-gray-600">
//                   {originAirport?.name} ({flight.origin})
//                 </p>
//               </div>

//               {/* Partie centrale : durée + icône avion */}
//               <div className="flex-1 flex flex-col items-center px-6">
//                 <p className="text-sm text-gray-600 mb-2">{flight.duration}</p>
//                 <div className="w-full flex items-center gap-2">
//                   <div className="h-px bg-blue-300 flex-1"></div>
//                   <Plane className="w-6 h-6 text-blue-600 rotate-90" />
//                   <div className="h-px bg-blue-300 flex-1"></div>
//                 </div>
//                 <p className="text-sm text-gray-600 mt-2">
//                   {flight.stops === 0
//                     ? "Vol direct"
//                     : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
//                 </p>
//               </div>

//               {/* Partie arrivée */}
//               <div className="flex-1 text-right">
//                 <p className="text-4xl font-bold mb-2">{flight.arrivalTime}</p>
//                 <p className="font-semibold">{destinationAirport?.city}</p>
//                 <p className="text-sm text-gray-600">
//                   {destinationAirport?.name} ({flight.destination})
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Grille d'informations sur le vol */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <div className="flex items-start gap-3">
//               <Calendar className="w-5 h-5 text-gray-400 mt-1" />
//               <div>
//                 <p className="text-xs text-gray-500">Date</p>
//                 <p className="font-semibold">
//                   {new Date(date).toLocaleDateString("fr-FR", {
//                     day: "numeric",
//                     month: "short",
//                   })}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3">
//               <Clock className="w-5 h-5 text-gray-400 mt-1" />
//               <div>
//                 <p className="text-xs text-gray-500">Durée</p>
//                 <p className="font-semibold">{flight.duration}</p>
//               </div>

//               <div className="flex items-start gap-3">
//                 <MapPin className="w-5 h-5 text-gray-400 mt-1" />{" "}
//               </div>

//               <div>
//                 <p className="text-xs text-gray-500">Classe</p>
//                 <p className="font-semibold">{flight.cabinClass}</p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3">
//               <Users className="w-5 h-5 text-gray-400 mt-1" />
//               <div>
//                 <p className="text-xs text-gray-500">Places restantes</p>
//                 <p className="font-semibold">{flight.availableSeats}</p>
//               </div>
//             </div>
//           </div>

//           {/* Informations sur l'appareil */}
//           <div className="border-t border-gray-200 pt-6">
//             <h3 className="font-semibold mb-3">Informations sur l'appareil</h3>
//             <p className="text-gray-600">{flight.aircraft}</p>
//           </div>
//         </div>

//         {/* Détails du tarif */}
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
//           <h3 className="font-semibold text-lg mb-4">Détails du tarif</h3>
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Tarif de base</span>
//               <span className="font-semibold">{flight.price - 50}€</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Taxes et frais</span>
//               <span className="font-semibold">50€</span>
//             </div>
//             <div className="border-t border-gray-200 pt-3 flex justify-between">
//               <span className="font-semibold">Total</span>
//               <span className="font-bold text-xl text-blue-600">
//                 {flight.price}€
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Services inclus */}
//         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
//           <h3 className="font-semibold text-lg mb-4">Services inclus</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-5 h-5 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <span className="text-gray-700">Bagage cabine (8kg)</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-5 h-5 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <span className="text-gray-700">Repas à bord</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-5 h-5 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <span className="text-gray-700">Sélection de siège</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-5 h-5 text-green-600"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <span className="text-gray-700">Divertissement à bord</span>
//             </div>
//           </div>
//         </div>

//         {/* Bouton de réservation */}
//         <button className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg">
//           Réserver ce vol
//         </button>

//         <p className="text-center text-sm text-gray-500 mt-4">
//           Prix final à confirmer lors du paiement
//         </p>
//       </div>

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// }

// // import { useParams, useSearchParams } from "react-router-dom";
// // import { Header } from "../composants/shared/Header";
// // import { Footer } from "../composants/shared/Footer";
// // import { Plane, Clock, Users, MapPin, Calendar } from "lucide-react";
// // import { useState, useEffect } from "react";

// // export function FlightDetails() {
// //   const { id } = useParams();

// //   const [searchParams] = useSearchParams();
// //   const [flight, setFlight] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const origin = searchParams.get("origin") || "CDG";
// //   const destination = searchParams.get("destination") || "JFK";
// //   const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

// //   if (!flight) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <h2 className="text-2xl font-bold text-gray-700 mb-4">
// //             Vol non trouvé
// //           </h2>
// //           <button
// //             onClick={() => navigate(-1)}
// //             className="text-blue-600 hover:underline"
// //           >
// //             Retour aux résultats
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const originAirport = airports.find((a) => a.code === flight.origin);
// //   const destinationAirport = airports.find(
// //     (a) => a.code === flight.destination
// //   );

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Header */}
// //       <Header showBackButton={true} />

// //       <div className="max-w-4xl mx-auto px-4 py-8">
// //         {/* Flight Summary Card */}
// //         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
// //           <div className="flex items-start justify-between mb-6">
// //             <div>
// //               <h2 className="text-3xl font-bold mb-2">{flight.airline}</h2>
// //               <p className="text-gray-600">Vol {flight.flightNumber}</p>
// //             </div>
// //             <div className="text-right">
// //               <p className="text-4xl font-bold text-blue-600">
// //                 {flight.price}€
// //               </p>
// //               <p className="text-sm text-gray-500">par passager</p>
// //             </div>
// //           </div>

// //           {/* Flight Route */}
// //           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
// //             <div className="flex items-center justify-between">
// //               <div className="flex-1">
// //                 <p className="text-4xl font-bold mb-2">
// //                   {flight.departureTime}
// //                 </p>
// //                 <p className="font-semibold">{originAirport?.city}</p>
// //                 <p className="text-sm text-gray-600">
// //                   {originAirport?.name} ({flight.origin})
// //                 </p>
// //               </div>

// //               <div className="flex-1 flex flex-col items-center px-6">
// //                 <p className="text-sm text-gray-600 mb-2">{flight.duration}</p>
// //                 <div className="w-full flex items-center gap-2">
// //                   <div className="h-px bg-blue-300 flex-1"></div>
// //                   <Plane className="w-6 h-6 text-blue-600 rotate-90" />
// //                   <div className="h-px bg-blue-300 flex-1"></div>
// //                 </div>
// //                 <p className="text-sm text-gray-600 mt-2">
// //                   {flight.stops === 0
// //                     ? "Vol direct"
// //                     : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
// //                 </p>
// //               </div>

// //               <div className="flex-1 text-right">
// //                 <p className="text-4xl font-bold mb-2">{flight.arrivalTime}</p>
// //                 <p className="font-semibold">{destinationAirport?.city}</p>
// //                 <p className="text-sm text-gray-600">
// //                   {destinationAirport?.name} ({flight.destination})
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Flight Details Grid */}
// //           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// //             <div className="flex items-start gap-3">
// //               <Calendar className="w-5 h-5 text-gray-400 mt-1" />
// //               <div>
// //                 <p className="text-xs text-gray-500">Date</p>
// //                 <p className="font-semibold">
// //                   {new Date(date).toLocaleDateString("fr-FR", {
// //                     day: "numeric",
// //                     month: "short",
// //                   })}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="flex items-start gap-3">
// //               <Clock className="w-5 h-5 text-gray-400 mt-1" />
// //               <div>
// //                 <p className="text-xs text-gray-500">Durée</p>
// //                 <p className="font-semibold">{flight.duration}</p>
// //               </div>
// //             </div>

// //             <div className="flex items-start gap-3">
// //               <MapPin className="w-5 h-5 text-gray-400 mt-1" />
// //               <div>
// //                 <p className="text-xs text-gray-500">Classe</p>
// //                 <p className="font-semibold">{flight.cabinClass}</p>
// //               </div>
// //             </div>

// //             <div className="flex items-start gap-3">
// //               <Users className="w-5 h-5 text-gray-400 mt-1" />
// //               <div>
// //                 <p className="text-xs text-gray-500">Places restantes</p>
// //                 <p className="font-semibold">{flight.availableSeats}</p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Aircraft Info */}
// //           <div className="border-t border-gray-200 pt-6">
// //             <h3 className="font-semibold mb-3">Informations sur l'appareil</h3>
// //             <p className="text-gray-600">{flight.aircraft}</p>
// //           </div>
// //         </div>

// //         {/* Fare Details */}
// //         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
// //           <h3 className="font-semibold text-lg mb-4">Détails du tarif</h3>
// //           <div className="space-y-3">
// //             <div className="flex justify-between">
// //               <span className="text-gray-600">Tarif de base</span>
// //               <span className="font-semibold">{flight.price - 50}€</span>
// //             </div>
// //             <div className="flex justify-between">
// //               <span className="text-gray-600">Taxes et frais</span>
// //               <span className="font-semibold">50€</span>
// //             </div>
// //             <div className="border-t border-gray-200 pt-3 flex justify-between">
// //               <span className="font-semibold">Total</span>
// //               <span className="font-bold text-xl text-blue-600">
// //                 {flight.price}€
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Included Services */}
// //         <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
// //           <h3 className="font-semibold text-lg mb-4">Services inclus</h3>
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
// //                 <svg
// //                   className="w-5 h-5 text-green-600"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M5 13l4 4L19 7"
// //                   />
// //                 </svg>
// //               </div>
// //               <span className="text-gray-700">Bagage cabine (8kg)</span>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
// //                 <svg
// //                   className="w-5 h-5 text-green-600"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M5 13l4 4L19 7"
// //                   />
// //                 </svg>
// //               </div>
// //               <span className="text-gray-700">Repas à bord</span>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
// //                 <svg
// //                   className="w-5 h-5 text-green-600"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M5 13l4 4L19 7"
// //                   />
// //                 </svg>
// //               </div>
// //               <span className="text-gray-700">Sélection de siège</span>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
// //                 <svg
// //                   className="w-5 h-5 text-green-600"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M5 13l4 4L19 7"
// //                   />
// //                 </svg>
// //               </div>
// //               <span className="text-gray-700">Divertissement à bord</span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Book Button */}
// //         <button className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg">
// //           Réserver ce vol
// //         </button>

// //         <p className="text-center text-sm text-gray-500 mt-4">
// //           Prix final à confirmer lors du paiement
// //         </p>
// //       </div>

// //       {/* Footer */}
// //       <Footer />
// //     </div>
// //   );
// // }
