import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // AJOUT : useLocation pour récupérer le vol cliqué
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
// import { GoogleLogin } from "@react-oauth/google";
// 1. IMPORTATION : Importez vos fonctions de favoris ici (ajustez le chemin selon votre projet)
import { toggleFavorite } from "../utils/favoritesStorage"; 


export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation(); // AJOUT : récupère les données envoyées depuis FlightCard
  
  const infoMessage = location.state?.message; 
// "Connecte-toi pour ajouter ce vol aux favoris."


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // ✅ MODIFICATION 2 : Nouvel état pour gérer l'affichage/cachage du mot de passe
  // showPassword = false → mot de passe masqué (•••••)
  // showPassword = true → mot de passe visible en clair
  const [showPassword, setShowPassword] = useState(false);

  // AJOUT : vol à sauvegarder si l'utilisateur vient du bouton favori
  const flightToSave = location.state?.flightToSave;

  // AJOUT : route de retour après connexion
  const redirectTo = location.state?.from || "/userDashboard";

  // AJOUT : handler commun pour les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // MODIF : URL backend, adapte si ton API tourne bien sur 3000
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      // ✅ Stocker le token et l'utilisateur
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // AJOUT : si un vol a été sélectionné avant la connexion, on l'ajoute aux favoris
      if (flightToSave) {
        const existingFavorites = localStorage.getItem("favoriteFlights");
        const favorites = existingFavorites
          ? JSON.parse(existingFavorites)
          : [];

        const alreadyExists = favorites.some(
          (item) => item.id === flightToSave.id,
        );

        if (!alreadyExists) {
          const updatedFavorites = [...favorites, flightToSave];
          localStorage.setItem(
            "favoriteFlights",
            JSON.stringify(updatedFavorites),
          );
        }
        // Étape B : Sauvegarde en Base de Données via l'API (si disponible)
        if (data.token && typeof toggleFavorite === "function") {
          try {
            await toggleFavorite({
              id: flightToSave.id,
              vol_id: flightToSave.id,
              origin: flightToSave.origin || flightToSave.originCity,
              destination: flightToSave.destination || flightToSave.destinationCity,
              price: flightToSave.price
            });
          } catch (apiError) {
            console.error("⚠️ Impossible de synchroniser le favori avec l'API après connexion:", apiError);
            // Pas de blocage : le localStorage a déjà pris le relais au-dessus
          }
        }
      }
      

        // AJOUT : redirection vers la bonne page après connexion
        if (data.user.role === "admin" || data.user.isAdmin === true) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error("❌ Erreur de connexion:", error);
        setError("Erreur serveur");
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
          
          {/* 📍 COUPEZ-COLLEZ CE BLOC ICI : Juste au début de la carte */}
        {infoMessage && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg shadow-sm animate-pulse-once">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{infoMessage}</p>
          </div>
        )}

          <h2 className="text-2xl font-bold text-white">Se connecter</h2>
          <p className="text-blue-100 text-sm mt-1">
            Bienvenue sur TKSkySearch
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Confirmer à partir de votre email et mot de passe
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="login-email"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="vous@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
