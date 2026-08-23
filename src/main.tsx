import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import "./index.css";
import "./premium-home.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

// If a deployment replaces hashed chunks while an older tab is still open,
// refresh once so the router loads the current asset manifest. The cooldown
// prevents a broken deployment from causing a reload loop.
window.addEventListener("vite:preloadError", (event) => {
  const storageKey = "vizit:last-preload-reload";
  const now = Date.now();
  let previous = 0;

  try {
    previous = Number(sessionStorage.getItem(storageKey) ?? 0);
    if (Number.isFinite(previous) && now - previous <= 10_000) return;
    sessionStorage.setItem(storageKey, String(now));
  } catch {
    // Let the rejected import reach the error boundary when storage is blocked.
    return;
  }

  event.preventDefault();
  window.location.reload();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
