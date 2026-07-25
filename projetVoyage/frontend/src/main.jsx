import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LocaleProvider } from "./contexts/LocaleContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="45806419430-ol7m0ort2aug9959rr7q9q3f5d4ja09b.apps.googleusercontent.com">
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
