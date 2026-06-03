import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
// import { GoogleLogin } from "@react-oauth/google";


export function LoginPage() {
  // const navigate = useNavigate();
  // const [formData, setFormData] = useState({
  //   email: "",
  //   password: "",
  // });
  // const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  // // --- Google Login (tu passes le token à ton backend Node.js) ---
  // const handleGoogleSuccess = async (credentialResponse) => {
  //   console.log("Jeton JWT reçu du Frontend :", credentialResponse.credential);

  //   try {
  //     const response = await fetch("http://localhost:3000/api/auth/google", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ token: credentialResponse.credential }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       console.log("Utilisateur Google connecté avec succès !", data);
  //       // Ici tu peux stocker ton propre token (JWT) et rediriger
  //       // ex: localStorage.setItem("token", data.token);
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("currentUser", JSON.stringify(data.user));

  //       // eslint-disable-next-line no-undef
  //       setIsSuccess(true);
  //       setTimeout(() => navigate("/"), 2000);
  //     } else {
  //       // eslint-disable-next-line no-undef
  //       setErrors({
  //         general: data.message || "Erreur lors de la connexion Google",
  //       });
  //     }
  //     // eslint-disable-next-line no-unused-vars
  //   } catch (error) {
  //     // eslint-disable-next-line no-undef
  //     setErrors({ general: "Impossible de contacter le serveur Google" });
  //   }
  // };

  // const handleGoogleError = () => {
  //   console.log("La connexion Google a échoué");
  //   // eslint-disable-next-line no-undef
  //   setErrors({ general: "Échec de la connexion Google" });
  // };
  // Fin logique Google


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const response = await fetch("http://localhost:3000/api/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       setError(data.message || "Email ou mot de passe incorrect");
  //       setLoading(false);
  //       return;
  //     }

  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("currentUser", JSON.stringify(data.user));

  //     navigate("/", { replace: true });
  //     window.location.reload();
  //   // eslint-disable-next-line no-unused-vars
  //   } catch (error) {
  //     setError("Erreur serveur");
  //     setLoading(false);
  //   }
  // };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

      // ✅ Log pour déboguer
      console.log("🟡 Rôle utilisateur:", data.user.role);
      console.log("🟡 isAdmin:", data.user.isAdmin);

      // ✅ Redirection selon le rôle
      if (data.user.role === "admin" || data.user.isAdmin === true) {
        console.log("🔵 Redirection vers /admin");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("🔵 Redirection vers /");
        navigate("/", { replace: true });
      }

      // eslint-disable-next-line no-unused-vars
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
          <h2 className="text-2xl font-bold text-white">Se connecter</h2>
          <p className="text-blue-100 text-sm mt-1">Bienvenue sur TKSkySearch</p>
        </div>

        <div className="px-6 py-5">
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              
              <div className="w-full border-t border-gray-300">
                
              </div>
              
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="vous@example.com"
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
                  type="password"
                  id="login-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
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


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Mail, Lock, AlertCircle } from "lucide-react";
// // import { Header } from "../composants/shared/Header";


// // const GoogleIcon = () => (
// //   <svg className="w-5 h-5" viewBox="0 0 24 24">
// //     <path
// //       fill="currentColor"
// //       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
// //     />
// //     <path
// //       fill="currentColor"
// //       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
// //     />
// //     <path
// //       fill="currentColor"
// //       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
// //     />
// //     <path
// //       fill="currentColor"
// //       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
// //     />
// //   </svg>
// // );

// // const FacebookIcon = () => (
// //   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
// //   </svg>
// // );

// // const AppleIcon = () => (
// //   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
// //   </svg>
// // );

// export function LoginPage() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
  

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Veuillez remplir tous les champs");
//       return;
//     }

//     const users = JSON.parse(localStorage.getItem("users") || "[]");
//     const user = users.find(
//       (u) => u.email === formData.email && u.password === formData.password
//     );

//     if (user) {
//       localStorage.setItem("currentUser", JSON.stringify(user));
//       navigate("/", { replace: true });
//       window.location.reload();
//     } else {
//       setError("Email ou mot de passe incorrect");
//     }
//   };

//   // const handleSocialLogin = (provider) => {
//   //   const user = {
//   //     name:
//   //       provider === "google"
//   //         ? "Utilisateur Google"
//   //         : provider === "facebook"
//   //         ? "Utilisateur Facebook"
//   //         : "Utilisateur Apple",
//   //     email: `user@${provider}.com`,
//   //     provider,
//   //     registrationDate: new Date().toISOString(),
//   //     avatar: provider,
//   //   };

//   //   localStorage.setItem("currentUser", JSON.stringify(user));
//   //   navigate("/", { replace: true });
//   //   window.location.reload();
//   // };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//         <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-2xl">
//           <h2 className="text-2xl font-bold text-white">Se connecter</h2>
//           <p className="text-blue-100 text-sm mt-1">Bienvenue sur TKSkySearch</p>
//         </div>

//         <div className="px-6 py-5">
         

//           <div className="relative mb-5">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-300"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 bg-white text-gray-500">
//                 Confirmer a partir de votre email et mot de passe
//               </span>
//             </div>
//           </div>

//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-600">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label
//                 htmlFor="login-email"
//                 className="block text-sm font-medium text-gray-700 mb-1.5"
//               >
//                 Adresse email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   id="login-email"
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="vous@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="login-password"
//                 className="block text-sm font-medium text-gray-700 mb-1.5"
//               >
//                 Mot de passe
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   type="password"
//                   id="login-password"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             {/* <div className="flex justify-end">
//               <button
//                 type="button"
//                 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Mot de passe oublié ?
//               </button>
//             </div> */}

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
//             >
//               Se connecter
//             </button>
//           </form>

//           <p className="text-center text-sm text-gray-600 mt-5">
//             Pas encore de compte ?{" "}
//             <button
//               type="button"
//               onClick={() => navigate("/register")}
//               className="text-blue-600 hover:text-blue-700 font-medium"
//             >
//               S'inscrire
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }