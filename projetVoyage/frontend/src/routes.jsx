import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Results } from "./pages/Results";
import { FlightDetails } from "./pages/FlightDetails";
import { Register } from "./pages/Register";
import { LoginPage } from "./pages/LoginPage";
import { MainLayout } from "./layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "results",
        Component: Results,
      },
      {
        path: "flight/:id",
        Component: FlightDetails,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "login",
        Component: LoginPage,
      },
    ],
  },
]);


// import { createBrowserRouter } from "react-router-dom";  // ✅ CORRIGÉ
// import { Home } from "./pages/Home";
// import { Results } from "./pages/Results";
// import { FlightDetails } from "./pages/FlightDetails";
// import { Register } from "./pages/Register";
// import {LoginPage} from "./pages/LoginPage"
// import {MainLayout} from "./layouts/MainLayout";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     Component: MainLayout,
//     children: [
//       {
//         index: true,
//         Component: Home,
//       },
//     ],
//   },
  
//   {
//     path: "/results",
//     Component: Results,
//   },
//   {
//     path: "/flight/:id",
//     Component: FlightDetails,
//   },
//   {
//     path: "/register",
//     Component: Register,
//   },
//   {
//     path: "/register/loginPage",
//     Component: LoginPage,
//   },
// ]);