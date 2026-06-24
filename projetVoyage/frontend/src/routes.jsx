import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Results } from "./pages/Results";
import { FlightDetails } from "./pages/FlightDetails";
import { Register } from "./pages/Register";
import { LoginPage } from "./pages/LoginPage";
import { MainLayout } from "./layouts/MainLayout";
import { UserDashboard } from "./pages/UserDashBoard";
import { AdminDashboard } from "./pages/AdminDashboard"; // 👈 Ajoutez votre page Admin
import { ProtectedRoute } from "./composants/UI/ProtectedRoute"; // 👈 Désactivez le commentaire
import { PageErreur404 } from "./pages/PageErreur404"; // 📍 IMPORTATION ICI


export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    errorElement: <PageErreur404 />, // 📍 Page d'erreur 404
    children: [
      // 🔓 Routes Publiques
      { index: true, Component: Home },
      { path: "results", Component: Results },
      { path: "flight/:id", Component: FlightDetails },
      { path: "register", Component: Register },
      { path: "login", Component: LoginPage },

      // 🔒 Routes Sécurisées pour les SIMPLES UTILISATEURS (et admins)
      {
        element: <ProtectedRoute allowedRoles={["user", "admin"]} />,
        children: [{ path: "user/favorites", Component: UserDashboard }],
      },

      // 🔒 Routes exclusivement réservées aux ADMINS
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "admin/dashboard", Component: AdminDashboard }, // 👈 URL cible après connexion Google Admin
        ],
      },
    ],
  },
]);

// import { createBrowserRouter } from "react-router-dom";
// import { Home } from "./pages/Home";
// import { Results } from "./pages/Results";
// import { FlightDetails } from "./pages/FlightDetails";
// import { Register } from "./pages/Register";
// import { LoginPage } from "./pages/LoginPage";
// import { MainLayout } from "./layouts/MainLayout";
// import { User } from "./pages/User";
// import { AdminDashboard } from "./pages/AdminDashboard";
// // import { ProtectedRoute } from "./composants/UI/ProtectedRoute";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     Component: MainLayout,
//     children: [
//       {
//         index: true,
//         Component: Home,
//       },
//       {
//         path: "results",
//         Component: Results,
//       },
//       {
//         path: "flight/:id",
//         Component: FlightDetails,
//       },
//       {
//         path: "register",
//         Component: Register,
//       },
//       {
//         path: "login",
//         Component: LoginPage,
//       },
//       {
//         path: "user",
//         Component: User,
//       },

//     ],
//   },
// ]);

// // import { createBrowserRouter } from "react-router-dom";  // ✅ CORRIGÉ
// // import { Home } from "./pages/Home";
// // import { Results } from "./pages/Results";
// // import { FlightDetails } from "./pages/FlightDetails";
// // import { Register } from "./pages/Register";
// // import {LoginPage} from "./pages/LoginPage"
// // import {MainLayout} from "./layouts/MainLayout";

// // export const router = createBrowserRouter([
// //   {
// //     path: "/",
// //     Component: MainLayout,
// //     children: [
// //       {
// //         index: true,
// //         Component: Home,
// //       },
// //     ],
// //   },

// //   {
// //     path: "/results",
// //     Component: Results,
// //   },
// //   {
// //     path: "/flight/:id",
// //     Component: FlightDetails,
// //   },
// //   {
// //     path: "/register",
// //     Component: Register,
// //   },
// //   {
// //     path: "/register/loginPage",
// //     Component: LoginPage,
// //   },
// // ]);
