// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force l'application à utiliser la copie de React du dossier racine
      // eslint-disable-next-line no-undef
      react: path.resolve(__dirname, "./node_modules/react"),
      // eslint-disable-next-line no-undef
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  server: {
  //   headers: {
  //   'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  // },
    proxy: {
      // Redirige toutes les requêtes commençant par /api vers le backend
      "/api": {
        target: "http://localhost:3000", // Mettez le port de votre backend ici
        changeOrigin: true,
        secure: false,
        // Optionnel : si votre backend n'attend pas le préfixe /api, décommentez la ligne rewrite
        // rewrite: (path) => path.replace(/^/api/, ''),
      },
    },
  },
});
