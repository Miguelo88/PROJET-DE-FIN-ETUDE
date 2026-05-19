import { createBrowserRouter } from "react-router-dom";  // ✅ CORRIGÉ
import { Home } from "./pages/Home";
import { Results } from "./pages/Results";
import { FlightDetails } from "./pages/FlightDetails";
import { Register } from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/results",
    Component: Results,
  },
  {
    path: "/flight/:id",
    Component: FlightDetails,
  },
  {
    path: "/register",
    Component: Register,
  },
]);