const PRODUCTION_API_URL = "https://api.vizit.am/api";

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL ?? "").trim();
  const placeholderHost = ["YOUR", "API", "DOMAIN"].join("_");

  if (!configured || configured.includes(placeholderHost)) {
    return PRODUCTION_API_URL;
  }

  return configured.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_ORIGIN = new URL(API_BASE_URL).origin;
