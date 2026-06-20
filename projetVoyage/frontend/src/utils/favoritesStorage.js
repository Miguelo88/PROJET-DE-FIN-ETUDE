// utils/favoritesStorage.js

// ↓ Fonctions localStorage (fallback) ↓

// Récupère les favoris depuis localStorage
export const getFavoritesLocalStorage = () => {
  const favorites = localStorage.getItem("favoriteFlights");
  return favorites ? JSON.parse(favorites) : [];
};

// Ajoute ou supprime un favori dans localStorage
export const toggleFavoriteLocalStorage = (flight) => {
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

// ↓ Fonctions BD (API) ↓

// Récupère les IDs de vols favoris depuis la BD
export const getFavorites = async () => {
  const token = localStorage.getItem('token');
  if (!token) return getFavoritesLocalStorage(); // fallback localStorage

  const res = await fetch('/api/favorites', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return getFavoritesLocalStorage(); // fallback localStorage
  const data = await res.json();
  const volIds = data.favorites || [];

  // Si la BD retourne des IDs, on les mappe ; sinon on retourne localStorage
  if (volIds.length > 0) {
    return volIds.map(volId => ({ id: volId }));
  }
  return getFavoritesLocalStorage();
};

// Ajoute un favori dans la BD
export const addFavoriteBD = async (flight) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Pas de token → utiliser localStorage
    return toggleFavoriteLocalStorage(flight);
  }

  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ vol_id: flight.id })
  });

  if (!res.ok) {
    // API échoue → utiliser localStorage
    return toggleFavoriteLocalStorage(flight);
  }

  // Retourne la liste actuelle depuis la BD
  return getFavorites();
};

// Supprime un favori dans la BD
export const removeFavoriteBD = async (flight) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Pas de token → utiliser localStorage
    const favorites = getFavoritesLocalStorage();
    return favorites.filter((item) => item.id !== flight.id);
  }

  const res = await fetch(`/api/favorites/${flight.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    // API échoue → utiliser localStorage
    const favorites = getFavoritesLocalStorage();
    return favorites.filter((item) => item.id !== flight.id);
  }

  // Retourne la liste actuelle depuis la BD
  return getFavorites();
};

// toggleFavorite : ajoute ou supprime avec fallback BD → localStorage
export const toggleFavorite = async (flight) => {
  const token = localStorage.getItem('token');


//   // Remplacez la récupération du token par ceci :
// const userRaw = localStorage.getItem('currentUser');
// const user = userRaw ? JSON.parse(userRaw) : null;
// const token = user ? user.token : null; // Vérifiez si votre backend y a mis un champ .token ou .jwt

  if (!token) return getFavoritesLocalStorage(); // Fallback si pas de token trouvé

  // Pas de token → utiliser localStorage uniquement
  if (!token) {
    return toggleFavoriteLocalStorage(flight);
  }

  try {
    // Essayer de lire depuis la BD
    const favorites = await getFavorites();
    const exists = favorites.some((item) => item.id === flight.id);

    if (exists) {
      return await removeFavoriteBD(flight);
    } else {
      return await addFavoriteBD(flight);
    }
  } catch(error) {
    // 🚀 AJOUTEZ CETTE LIGNE POUR TRAQUER LE BUG :
    console.error("[FRONTEND CRASH] Erreur dans toggleFavorite, bascule sur localStorage :", error);
    
    // Si quelque chose échoue → utiliser localStorage
    return toggleFavoriteLocalStorage(flight);
  }
};












// utils/favoritesStorage.js

// Récupère les IDs de vols favoris depuis la BD
// export const getFavorites = async () => {
//   const token = localStorage.getItem('jsonwebtoken');
//   if (!token) return [];

//   const res = await fetch('/api/favorites', {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });

//   if (!res.ok) return [];
//   const data = await res.json();
//   // data.favorites = [vol_id, vol_id, ...]
//   const volIds = data.favorites || [];

//   // Retourne un tableau d'objets { id: vol_id } pour garder la même forme que l'ancien
//   return volIds.map(volId => ({ id: volId }));
// };

// // Ajout ou suppression dans la BD (remplace le localStorage)
// export const toggleFavorite = async (flight) => {
//   const token = localStorage.getItem('jsonwebtoken');
//   if (!token) return getFavorites();

//   const favorites = await getFavorites();
//   const exists = favorites.some((item) => item.id === flight.id);

//   if (exists) {
//     // Supprimer de la BD
//     const res = await fetch(`/api/favorites/${flight.id}`, {
//       method: 'DELETE',
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     if (!res.ok) return favorites;
//     // Retirer localement
//     return favorites.filter((item) => item.id !== flight.id);
//   } else {
//     // Ajouter à la BD
//     const res = await fetch('/api/favorites', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify({ vol_id: flight.id })
//     });
//     if (!res.ok) return favorites;
//     // Ajouter localement
//     return [...favorites, { id: flight.id }];
//   }
// };








// export const getFavorites = () => {
//   const favorites = localStorage.getItem("favoriteFlights");
//   return favorites ? JSON.parse(favorites) : [];
// };

// export const toggleFavorite = (flight) => {
//   const favorites = getFavorites();
//   const exists = favorites.some((item) => item.id === flight.id);

//   let updatedFavorites;

//   if (exists) {
//     updatedFavorites = favorites.filter((item) => item.id !== flight.id);
//   } else {
//     updatedFavorites = [...favorites, flight];
//   }

//   localStorage.setItem("favoriteFlights", JSON.stringify(updatedFavorites));
//   return updatedFavorites;
// };
