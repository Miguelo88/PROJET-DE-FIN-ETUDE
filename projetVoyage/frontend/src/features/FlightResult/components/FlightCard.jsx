import { Plane, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";



export function FlightCard({ flight }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{flight.airline}</h3>
          <p className="text-sm text-gray-500">{flight.flightNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{flight.price}€</p>
          <p className="text-xs text-gray-500">par passager</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-2xl font-semibold">{flight.departureTime}</p>
          <p className="text-sm text-gray-600">{flight.origin}</p>
        </div>

        <div className="flex-1 flex flex-col items-center px-4">
          <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
          <div className="w-full flex items-center gap-1">
            <div className="h-px bg-gray-300 flex-1"></div>
            <Plane className="w-4 h-4 text-gray-400 rotate-90" />
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {flight.stops === 0
              ? "Direct"
              : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex-1 text-right">
          <p className="text-2xl font-semibold">{flight.arrivalTime}</p>
          <p className="text-sm text-gray-600">{flight.destination}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{flight.aircraft}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{flight.cabinClass}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/flight/${flight.id}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sélectionner
        </button>
      </div>

      {flight.availableSeats < 20 && (
        <p className="text-xs text-orange-600 mt-2">
          Plus que {flight.availableSeats} places disponibles
        </p>
      )}
    </div>
  );
}