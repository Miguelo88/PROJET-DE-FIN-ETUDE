import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { Plane, Clock, Users, MapPin, Calendar } from "lucide-react";
import { generateMockFlights, airports } from "../data/mockFlights";


export function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const origin = searchParams.get("origin") || "CDG";
  const destination = searchParams.get("destination") || "JFK";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const flights = generateMockFlights(origin, destination, date);
  const flight = flights.find((f) => f.id === id);

  if (!flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Vol non trouvé
          </h2>
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

  const originAirport = airports.find((a) => a.code === flight.origin);
  const destinationAirport = airports.find(
    (a) => a.code === flight.destination
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showBackButton={true} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Flight Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
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

          {/* Flight Route */}
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

          {/* Flight Details Grid */}
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
                <p className="font-semibold">{flight.availableSeats}</p>
              </div>
            </div>
          </div>

          {/* Aircraft Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-3">Informations sur l'appareil</h3>
            <p className="text-gray-600">{flight.aircraft}</p>
          </div>
        </div>

        {/* Fare Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="font-semibold text-lg mb-4">Détails du tarif</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tarif de base</span>
              <span className="font-semibold">{flight.price - 50}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes et frais</span>
              <span className="font-semibold">50€</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl text-blue-600">
                {flight.price}€
              </span>
            </div>
          </div>
        </div>

        {/* Included Services */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="font-semibold text-lg mb-4">Services inclus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700">Bagage cabine (8kg)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700">Repas à bord</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700">Sélection de siège</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700">Divertissement à bord</span>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <button className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg">
          Réserver ce vol
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Prix final à confirmer lors du paiement
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}