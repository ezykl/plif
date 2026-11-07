import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { registerServiceWorker } from "./pwa";
import { PDF_WORKER_URL } from "./import/pdf";

if (import.meta.env.PROD) {
  void registerServiceWorker("/sw.js", [PDF_WORKER_URL]);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
