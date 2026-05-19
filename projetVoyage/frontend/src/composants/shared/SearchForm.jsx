import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, Calendar, Users, Search, ChevronDown, Plus, Minus } from "lucide-react";
import { airports } from "../../data/mockFlights";



export function SearchForm({ compact = false }) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("round-trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [showPassengersMenu, setShowPassengersMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const totalPassengers = adults + children;
    if (origin && destination && departDate) {
      navigate(
        `/results?origin=${origin}&destination=${destination}&date=${departDate}&passengers=${totalPassengers}&tripType=${tripType}${
          returnDate ? `&returnDate=${returnDate}` : ""
        }`
      );
    }
  };

  const totalPassengers = adults + children;

  return (
    <form onSubmit={handleSearch} className={compact ? "" : "w-full max-w-5xl"}>
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        {/* Trip Type */}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setTripType("round-trip")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tripType === "round-trip"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Retour
          </button>
          <button
            type="button"
            onClick={() => setTripType("one-way")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tripType === "one-way"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Aller simple
          </button>
        </div>

        {/* Search Fields - Horizontal Layout */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Origin */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Depuis
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin ? airports.find(a => a.code === origin)?.city || origin : ""}
                readOnly
                placeholder="Pays, ville ou aéroport"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  const select = e.currentTarget.nextElementSibling;
                  if (select) {
                    select.focus();
                    select.click();
                  }
                }}
              />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="">Sélectionnez</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="pb-3">
            <button
              type="button"
              onClick={() => {
                const temp = origin;
                setOrigin(destination);
                setDestination(temp);
              }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              À
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination ? airports.find(a => a.code === destination)?.city || destination : ""}
                readOnly
                placeholder="Pays, ville ou aéroport"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  const select = e.currentTarget.nextElementSibling;
                  if (select) {
                    select.focus();
                    select.click();
                  }
                }}
              />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="">Sélectionnez</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.city} ({airport.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Depart Date */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Partir
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                placeholder="Ajouter la date"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Return Date */}
          {tripType === "round-trip" && (
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Retour
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departDate}
                  placeholder="Ajouter la date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Passengers & Cabin Class */}
          <div className="flex-1 min-w-[220px] relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Voyageurs et classe cabine
            </label>
            <button
              type="button"
              onClick={() => setShowPassengersMenu(!showPassengersMenu)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {totalPassengers} {totalPassengers === 1 ? "adulte" : "voyageur"}{adults > 1 && children === 0 ? "s" : ""}, {cabinClass === "economy" ? "classe écono..." : cabinClass}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showPassengersMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowPassengersMenu(false)}
                ></div>
                <div className="absolute top-full mt-2 left-0 w-full md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-20">
                  <h3 className="font-semibold text-sm mb-4">Classe cabine</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Seuls les prix économiques peuvent être affichés pour cette recherche.
                  </p>

                  {/* Cabin Class Options */}
                  <div className="space-y-2 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cabinClass"
                        value="economy"
                        checked={cabinClass === "economy"}
                        onChange={(e) => setCabinClass(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">Économique</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cabinClass"
                        value="premium"
                        checked={cabinClass === "premium"}
                        onChange={(e) => setCabinClass(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">Économique Premium</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cabinClass"
                        value="business"
                        checked={cabinClass === "business"}
                        onChange={(e) => setCabinClass(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">Affaires</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cabinClass"
                        value="first"
                        checked={cabinClass === "first"}
                        onChange={(e) => setCabinClass(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm">Première</span>
                    </label>
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <p className="font-medium text-sm">Adultes</p>
                      <p className="text-xs text-gray-500">18 ans et plus</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-3 border-t border-gray-200">
                    <div>
                      <p className="font-medium text-sm">Enfants</p>
                      <p className="text-xs text-gray-500">De 0 à 17 ans</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {children > 0 && (
                    <p className="text-xs text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg">
                      Votre âge au moment du voyage doit correspondre à la catégorie d'âge réservée. Les compagnies aériennes appliquent des restrictions aux mineurs.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassengersMenu(false)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Terminé
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search Button */}
          <div className="pb-0">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-[48px]"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Recherche</span>
            </button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
            <span>Ajouter les aéroports à proximité</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
            <span>Vols directs</span>
          </label>
        </div>
      </div>
    </form>
  );
}