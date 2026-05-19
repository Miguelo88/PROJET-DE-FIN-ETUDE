import { SlidersHorizontal } from "lucide-react";


export function FilterSidebar({
  maxPrice,
  priceRange,
  onPriceChange,
  stops,
  onStopsChange,
  airlines,
  selectedAirlines,
  onAirlinesChange,
  sortBy,
  onSortChange,
}) {
  const handleAirlineToggle = (airline) => {
    if (selectedAirlines.includes(airline)) {
      onAirlinesChange(selectedAirlines.filter((a) => a !== airline));
    } else {
      onAirlinesChange([...selectedAirlines, airline]);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
      <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5" />
        Filtres et tri
      </h2>


      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trier par
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="duration-asc">Durée la plus courte</option>
          <option value="departure-asc">Départ le plus tôt</option>
          <option value="departure-desc">Départ le plus tard</option>
        </select>
      </div>


      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prix maximum: {priceRange[1]}€
        </label>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={priceRange[1]}
          onChange={(e) => onPriceChange([0, Number(e.target.value)])}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0€</span>
          <span>{maxPrice}€</span>
        </div>
      </div>


      {/* Stops Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escales
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="all"
              checked={stops === "all"}
              onChange={(e) => onStopsChange(e.target.value)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm">Tous les vols</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="direct"
              checked={stops === "direct"}
              onChange={(e) => onStopsChange(e.target.value)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm">Direct uniquement</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="stops"
              value="1-stop"
              checked={stops === "1-stop"}
              onChange={(e) => onStopsChange(e.target.value)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm">Maximum 1 escale</span>
          </label>
        </div>
      </div>


      {/* Airlines Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compagnies aériennes
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {airlines.map((airline) => (
            <label
              key={airline}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedAirlines.includes(airline)}
                onChange={() => handleAirlineToggle(airline)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm">{airline}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Reset Filters */}
      <button
        onClick={() => {
          onPriceChange([0, maxPrice]);
          onStopsChange("all");
          onAirlinesChange([]);
        }}
        className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}