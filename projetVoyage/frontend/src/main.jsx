import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LocaleProvider } from "./contexts/LocaleContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="385666932569-dj85vhevi0drutqt82rv1vc6ffnbuo7a.apps.googleusercontent.com">
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
