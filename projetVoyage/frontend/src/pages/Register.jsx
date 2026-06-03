import "react";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { User, Mail, Lock, Calendar, CheckCircle } from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Google Login (tu passes le token à ton backend Node.js) ---
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Jeton JWT reçu du Frontend :", credentialResponse.credential);

    try {
      const response = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });


      const data = await response.json();
      console.log("--- INSPECTION COMPLÈTE DE LA RÉPONSE DU SERVEUR ---");
      console.log(JSON.stringify(data, null, 2));

      // const data = await response.json();
      // console.log("🟡 Réponse du backend :", data);
      // console.log("🟡 Rôle utilisateur :", data.user.role);
      // console.log("🟡 isAdmin :", data.user?.isAdmin);

      if (response.ok) {
        console.log("Utilisateur Google connecté avec succès !", data);
        // Ici tu peux stocker ton propre token (JWT) et rediriger
        // ex: localStorage.setItem("token", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        const userEmail = data.user.email;
        if (userEmail === "miguelkamdem92@gmail.com") {
          console.log("⚠️ Redirection forcée Admin par Email.");
          navigate("/admin/dashboard"); // Ou /admin selon votre routeur
        } else {
          console.log("Utilisateur standard. Redirection...");
          setTimeout(() => navigate("/"), 2000);
        }
      
        // // ✅ Redirection intelligente selon le rôle
        // if (data.user && data.user.role === "admin") {
        //   console.log(
        //     "Accès admin détecté. Redirection vers le tableau de bord...",
        //   );
        //   navigate("/admin/dashboard"); // 👈 Doit correspondre exactement à votre route admin
        // } else {
        //   console.log("Utilisateur standard. Redirection après 2 secondes...");
        //   // Laisse le temps à l'utilisateur de voir le message de succès (setIsSuccess)
        //   setTimeout(() => navigate("/"), 2000);
        // }

        // // ✅ 3. Redirection selon le rôle
        // if (data.user.role === "admin") {
        //   console.log("acces admin detecte. redirection vers la page")
        //   navigate("/admin");
        // } else {
        //   navigate("/");
        // }
        // setIsSuccess(true);
        // setTimeout(() => navigate("/"), 2000);
      } else {
        setErrors({
          general: data.message || "Erreur lors de la connexion Google",
        });
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErrors({ general: "Impossible de contacter le serveur Google" });
    }
  };

  const handleGoogleError = () => {
    console.log("La connexion Google a échoué");
    setErrors({ general: "Échec de la connexion Google" });
  };
  // Fin logique Google

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: data.message });
        } else {
          setErrors({ general: data.message || "Une erreur est survenue" });
        }
        return;
      }
      // ✅ 1. Stocker le token dans localStorage
      localStorage.setItem("token", data.token);

      // ✅ 2. Stocker les infos utilisateur
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // ✅ 3. Redirection selon le rôle
      console.log("Utilisateur créé avec rôle:", data.user.role);
      if (data.user.role === "admin") {
        navigate("/admin"); // Page administrateur
      } else {
        navigate("/"); // Page utilisateur par défaut
      }

      setIsSuccess(true);

      // setTimeout(() => {
      //   navigate("/");
      // }, 2000);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setErrors({ general: "Impossible de contacter le serveur" });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header showBackButton />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Inscription réussie !
            </h2>
            <p className="text-gray-600 mb-4">
              Bienvenue {formData.name} ! Votre compte a été créé avec succès.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers la page d'accueil...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBackButton />

      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">
                Créer un compte
              </h1>
              <p className="text-blue-100 text-sm">
                Rejoignez SkySearch pour réserver vos vols facilement
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 text-center">
                  Continuer avec
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {/* Google (bouton custom mais avec GoogleLogin en fond) */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      text="signin_with"
                      shape="pill"
                      theme="outline"
                      size="large"
                      locale="fr"
                    />
                  </div>

                  {/* <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="text-blue-600">
                      <FacebookIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                      Facebook
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("apple")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="text-gray-900">
                      <AppleIcon />
                    </div>
                    <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                      Apple
                    </span>
                  </button> */}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Ou avec votre email
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Jean Dupont"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="jean.dupont@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  La date d'inscription sera automatiquement enregistrée lors de
                  la création de votre compte.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Créer mon compte
              </button>

              <p className="text-center text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Se connecter
                </button>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6 px-4">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Politique de confidentialité
            </a>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
