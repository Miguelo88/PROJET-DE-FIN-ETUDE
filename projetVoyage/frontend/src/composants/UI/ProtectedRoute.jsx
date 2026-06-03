import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Pas de jeton -> redirection vers la page de connexion
    return <Navigate to="/login" replace />;
  }

  try {
    // Décodage du jeton généré par votre backend
    const decoded = jwtDecode(token);
    const userRole = decoded.role || "user";

    // Vérification si le rôle de l'utilisateur est autorisé
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Rôle non autorisé -> redirection vers l'accueil ou une page d'erreur
      // eslint-disable-next-line react-hooks/error-boundaries
      return <Navigate to="/" replace />;
    }

    // Autorisé -> affiche les composants enfants
    // eslint-disable-next-line react-hooks/error-boundaries
    return <Outlet/>;
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // Jeton invalide ou corrompu -> nettoyage et redirection
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};


// import { Navigate, Outlet } from "react-router-dom";

// export function ProtectedRoute() {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//   return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
// }