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

function mapLocale(locale: Locale) {
  // Yandex currently has no Armenian map-label locale. English is the most
  // neutral fallback while every Vizit overlay remains Armenian.
  return locale === "ru" ? "ru_RU" : "en_US";
}

export function hasYandexMapsKey() {
  return Boolean(import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim());
}

export function loadYandexMaps(locale: Locale): Promise<YandexMapsApi> {
  if (window.ymaps3) {
    return window.ymaps3.ready.then(() => window.ymaps3 as YandexMapsApi);
  }

  if (apiPromise) return apiPromise;

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return Promise.reject(new Error("VITE_YANDEX_MAPS_API_KEY is not configured"));
  }

  apiPromise = new Promise<YandexMapsApi>((resolve, reject) => {
    const finish = () => {
      const api = window.ymaps3;
      if (!api) {
        apiPromise = null;
        reject(new Error("Yandex Maps API did not initialize"));
        return;
      }
      api.ready.then(() => resolve(api)).catch((error) => {
        apiPromise = null;
        reject(error);
      });
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => {
        apiPromise = null;
        reject(new Error("Yandex Maps API failed to load"));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=${mapLocale(locale)}&csp=202512`;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => {
      apiPromise = null;
      reject(new Error("Yandex Maps API failed to load"));
    }, { once: true });
    document.head.appendChild(script);
  });

  return apiPromise;
}
