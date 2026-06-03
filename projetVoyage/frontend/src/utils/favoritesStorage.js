const FAVORITES_KEY = "favorites";

export function getFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(flight) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.id === flight.id);

  let updatedFavorites;
  if (exists) {
    updatedFavorites = favorites.filter((item) => item.id !== flight.id);
  } else {
    updatedFavorites = [...favorites, flight];
  }

  saveFavorites(updatedFavorites);
  return updatedFavorites;
}