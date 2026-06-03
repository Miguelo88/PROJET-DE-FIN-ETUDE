import { useEffect, useState } from "react";
import { getFavorites } from "../utils/favoritesStorage";
import { FlightCard } from "../features/FlightResult/components/FlightCard";

export function User() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(getFavorites());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Mes vols favoris</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-600">Aucun vol favori pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {favorites.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}
