import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import { isUsingMock, preloadBackend } from "./lib/backend";

// Kick off anonymous Supabase auth before the first render so the
// session exists by the time HomeScreen mounts. Don't block the UI —
// feature methods surface their own errors; we log here so devs see
// the cause in the console.
if (!isUsingMock) {
  preloadBackend()
    .then(() => import("./lib/supabaseBackend"))
    .then(({ initSupabase }) => initSupabase())
    .catch((err) => console.warn("Supabase init failed:", err));
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
