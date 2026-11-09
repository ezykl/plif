import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./pwa";
import { PDF_WORKER_URL } from "./import/pdf";
import "@fontsource/cinzel/600.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/cormorant-garamond/600.css";

if (import.meta.env.PROD) {
  void registerServiceWorker(`${import.meta.env.BASE_URL}sw.js`, [PDF_WORKER_URL]);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
