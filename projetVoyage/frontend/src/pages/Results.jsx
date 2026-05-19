import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FlightCard } from "../features/FlightResult/components/FlightCard";
import { FilterSidebar } from "../features/FlightFilters/FilterSidebar";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { generateMockFlights, airports } from "../data/mockFlights";
import { Plane } from "lucide-react";


export function Results() {
  const [searchParams] = useSearchParams();
  

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = searchParams.get("passengers") || "1";

  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [stops, setStops] = useState("all");
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");

  useEffect(() => {
    const mockFlights = generateMockFlights(origin, destination, date);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlights(mockFlights);

    const max = Math.max(...mockFlights.map((f) => f.price));
    setMaxPrice(max);
    setPriceRange([0, max]);
  }, [origin, destination, date]);

  useEffect(() => {
    let filtered = [...flights];

    // Filter by price
    filtered = filtered.filter(
      (f) => f.price >= priceRange[0] && f.price <= priceRange[1]
    );

    // Filter by stops
    if (stops === "direct") {
      filtered = filtered.filter((f) => f.stops === 0);
    } else if (stops === "1-stop") {
      filtered = filtered.filter((f) => f.stops <= 1);
    }

    // Filter by airlines
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter((f) => selectedAirlines.includes(f.airline));
    }

    // Sort
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
        filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case "departure-desc":
        filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
        break;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredFlights(filtered);
  }, [flights, priceRange, stops, selectedAirlines, sortBy]);

  const uniqueAirlines = Array.from(new Set(flights.map((f) => f.airline)));

  const originCity = airports.find((a) => a.code === origin)?.city || origin;
  const destinationCity =
    airports.find((a) => a.code === destination)?.city || destination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
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
            {filteredFlights.length} vol{filteredFlights.length > 1 ? "s" : ""}{" "}
            trouvé{filteredFlights.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
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

          {/* Flight Results */}
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

      {/* Footer */}
      <Footer />
    </div>
  );
}