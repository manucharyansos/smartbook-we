import type { Locale } from "../contexts/LanguageContext";

export type YandexLngLat = [number, number];

export type YandexMapLocation = {
  center: YandexLngLat;
  zoom: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
};

export type YandexMapInstance = {
  addChild: (child: unknown) => YandexMapInstance;
  removeChild: (child: unknown) => YandexMapInstance;
  update: (props: Record<string, unknown>) => void;
  destroy: () => void;
};

export type YandexMapsApi = {
  ready: Promise<void>;
  YMap: new (container: HTMLElement, props: Record<string, unknown>) => YandexMapInstance;
  YMapDefaultSchemeLayer: new (props?: Record<string, unknown>) => unknown;
  YMapDefaultFeaturesLayer: new (props?: Record<string, unknown>) => unknown;
  YMapListener: new (props: Record<string, unknown>) => unknown;
  YMapMarker: new (props: Record<string, unknown>, element?: HTMLElement) => unknown;
};

declare global {
  interface Window {
    ymaps3?: YandexMapsApi;
  }
}

const SCRIPT_ID = "vizit-yandex-maps-api";
let apiPromise: Promise<YandexMapsApi> | null = null;
let activeMapLocale: string | null = null;
let loadingMapLocale: string | null = null;
let loadGeneration = 0;

function mapLocale(locale: Locale) {
  // Yandex currently has no Armenian map-label locale. English is the most
  // neutral fallback while every Vizit overlay remains Armenian.
  return locale === "ru" ? "ru_RU" : "en_US";
}

export function hasYandexMapsKey() {
  return Boolean(import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim());
}

export function loadYandexMaps(locale: Locale): Promise<YandexMapsApi> {
  const requestedLocale = mapLocale(locale);

  if (window.ymaps3 && (!activeMapLocale || activeMapLocale === requestedLocale)) {
    activeMapLocale = requestedLocale;
    return window.ymaps3.ready.then(() => window.ymaps3 as YandexMapsApi);
  }

  if (apiPromise && loadingMapLocale === requestedLocale) return apiPromise;

  if (activeMapLocale !== requestedLocale || loadingMapLocale !== requestedLocale) {
    loadGeneration += 1;
    document.getElementById(SCRIPT_ID)?.remove();
    delete window.ymaps3;
    apiPromise = null;
    activeMapLocale = null;
    loadingMapLocale = null;
  }

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error("VITE_YANDEX_MAPS_API_KEY is not configured"));
  }

  const generation = loadGeneration;
  loadingMapLocale = requestedLocale;
  apiPromise = new Promise<YandexMapsApi>((resolve, reject) => {
    const finish = () => {
      if (generation !== loadGeneration) {
        reject(new Error("Yandex Maps API locale load was superseded"));
        return;
      }
      const api = window.ymaps3;
      if (!api) {
        apiPromise = null;
        loadingMapLocale = null;
        reject(new Error("Yandex Maps API did not initialize"));
        return;
      }
      api.ready.then(() => {
        activeMapLocale = requestedLocale;
        loadingMapLocale = null;
        resolve(api);
      }).catch((error) => {
        apiPromise = null;
        loadingMapLocale = null;
        reject(error);
      });
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.dataset.locale = requestedLocale;
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=${requestedLocale}&csp=202512`;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => {
      if (generation === loadGeneration) {
        apiPromise = null;
        loadingMapLocale = null;
      }
      reject(new Error("Yandex Maps API failed to load"));
    }, { once: true });
    document.head.appendChild(script);
  });

  return apiPromise;
}
