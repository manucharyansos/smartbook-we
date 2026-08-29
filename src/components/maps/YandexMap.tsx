import { useEffect, useRef, useState, type ReactNode } from "react";

import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../../lib/cn";
import {
  hasYandexMapsKey,
  loadYandexMaps,
  type YandexMapInstance,
  type YandexMapLocation,
  type YandexMapsApi,
} from "../../lib/yandexMaps";

export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type VizitMapMarker = MapCoordinates & {
  id: string;
  label: string;
  variant?: "service" | "healthcare" | "active" | "user";
  active?: boolean;
};

export type YandexMapBehavior =
  | "drag"
  | "pinchZoom"
  | "scrollZoom"
  | "dblClick"
  | "magnifier"
  | "oneFingerZoom"
  | "mouseRotate"
  | "mouseTilt"
  | "pinchRotate"
  | "panTilt";

type Props = {
  center: MapCoordinates;
  zoom: number;
  markers?: VizitMapMarker[];
  onMarkerClick?: (id: string) => void;
  onLocationChange?: (center: MapCoordinates, zoom: number) => void;
  behaviors?: readonly YandexMapBehavior[];
  interactionLocked?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
};

const errorCopy = {
  hy: {
    title: "Քարտեզը չբեռնվեց",
    text: "Ստուգեք կապը կամ Yandex Maps բանալու կարգավորումները։",
    loading: "Քարտեզը բեռնվում է…",
  },
  ru: {
    title: "Карта не загрузилась",
    text: "Проверьте подключение или настройки ключа Yandex Maps.",
    loading: "Карта загружается…",
  },
  en: {
    title: "The map did not load",
    text: "Check the connection or the Yandex Maps key settings.",
    loading: "Loading the map…",
  },
} as const;

function makePinElement(marker: VizitMapMarker) {
  if (marker.variant === "user") {
    const user = document.createElement("div");
    user.className = "vizit-yandex-user-marker";
    user.setAttribute("role", "img");
    user.setAttribute("aria-label", marker.label);
    user.title = marker.label;
    return user;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = [
    "vizit-yandex-marker",
    `vizit-yandex-marker--${marker.variant ?? "service"}`,
    marker.active ? "is-active" : "",
  ].filter(Boolean).join(" ");
  button.setAttribute("aria-label", marker.label);
  button.dataset.markerId = marker.id;
  button.title = marker.label;

  const icon = document.createElement("span");
  icon.className = "vizit-yandex-marker__icon";
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.7"></circle></svg>';

  const label = document.createElement("span");
  label.className = "vizit-yandex-marker__label";
  label.textContent = marker.label;

  button.append(icon, label);
  return button;
}

export default function YandexMap({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  onLocationChange,
  behaviors,
  interactionLocked = false,
  disabled = false,
  className,
  ariaLabel,
  children,
}: Props) {
  const { locale } = useLanguage();
  const { resolvedTheme } = useTheme();
  const text = errorCopy[locale];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const apiRef = useRef<YandexMapsApi | null>(null);
  const markerEntitiesRef = useRef<unknown[]>([]);
  const onLocationChangeRef = useRef(onLocationChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  const [readyVersion, setReadyVersion] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(() => hasYandexMapsKey() ? "loading" : "error");

  onLocationChangeRef.current = onLocationChange;
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    setStatus(hasYandexMapsKey() ? "loading" : "error");

    loadYandexMaps(locale)
      .then((api) => {
        if (disposed || !containerRef.current) return;

        const map = new api.YMap(containerRef.current, {
          location: {
            center: [center.longitude, center.latitude],
            zoom,
          },
          theme: resolvedTheme,
          mode: "auto",
          type: "future-map",
          showScaleInCopyrights: true,
          copyrightsPosition: "bottom right",
          ...(behaviors ? { behaviors: [...behaviors] } : {}),
        });

        map.addChild(new api.YMapDefaultSchemeLayer());
        map.addChild(new api.YMapDefaultFeaturesLayer({ zIndex: 1800 }));
        map.addChild(new api.YMapListener({
          layer: "any",
          onActionEnd: (event: { location?: YandexMapLocation }) => {
            const location = event.location;
            if (!location?.center || !Number.isFinite(location.zoom)) return;
            onLocationChangeRef.current?.({
              latitude: location.center[1],
              longitude: location.center[0],
            }, location.zoom);
          },
        }));

        apiRef.current = api;
        mapRef.current = map;
        setStatus("ready");
        setReadyVersion((value) => value + 1);
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });

    return () => {
      disposed = true;
      markerEntitiesRef.current = [];
      try { mapRef.current?.destroy(); } catch { /* map may already be detached */ }
      mapRef.current = null;
      apiRef.current = null;
      container.replaceChildren();
    };
    // Changing between Yandex-supported locales reloads the provider script;
    // every Vizit overlay also reacts immediately to locale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.update({
      location: {
        center: [center.longitude, center.latitude],
        zoom,
        duration: 180,
        easing: "ease-out",
      },
      theme: resolvedTheme,
    });
  }, [center.latitude, center.longitude, resolvedTheme, zoom, readyVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !behaviors) return;
    map.update({ behaviors: [...behaviors] });
  }, [behaviors, readyVersion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || status !== "ready") return;

    const improveProviderAccessibility = () => {
      container.querySelectorAll<HTMLImageElement>("img:not([alt])").forEach((image) => {
        image.alt = "";
      });
      container.querySelectorAll<HTMLAnchorElement>("a.ymaps3--map-copyrights__logo").forEach((link) => {
        if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", "Yandex Maps");
      });
    };

    improveProviderAccessibility();
    const observer = new MutationObserver(improveProviderAccessibility);
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [status]);

  useEffect(() => {
    const map = mapRef.current;
    const api = apiRef.current;
    if (!map || !api || status !== "ready") return;

    for (const entity of markerEntitiesRef.current) {
      try { map.removeChild(entity); } catch { /* entity may already be detached */ }
    }

    const nextEntities = markers.map((marker) => {
      const element = makePinElement(marker);
      if (marker.variant !== "user") {
        element.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          onMarkerClickRef.current?.(marker.id);
        });
      }

      const entity = new api.YMapMarker({
        coordinates: [marker.longitude, marker.latitude],
        zIndex: marker.active ? 2200 : marker.variant === "user" ? 2100 : 2000,
        blockEvents: true,
        blockBehaviors: true,
        hideOutsideViewport: true,
      }, element);
      map.addChild(entity);
      return entity;
    });

    markerEntitiesRef.current = nextEntities;
    return () => {
      for (const entity of nextEntities) {
        try { map.removeChild(entity); } catch { /* map may already be destroyed */ }
      }
      if (markerEntitiesRef.current === nextEntities) markerEntitiesRef.current = [];
    };
  }, [markers, readyVersion, status]);

  return (
    <div
      className={cn(
        "vizit-yandex-map-shell relative isolate overflow-hidden bg-slate-100 dark:bg-slate-900",
        interactionLocked && "vizit-yandex-map-shell--interaction-locked",
        className,
      )}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={containerRef}
        className="vizit-yandex-map-provider absolute inset-0 z-0"
        style={{ touchAction: interactionLocked ? "pan-y" : undefined }}
      />

      {status === "loading" ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/72 text-sm font-semibold text-slate-600 backdrop-blur-sm dark:bg-slate-950/65 dark:text-slate-200" role="status">
          <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-slate-900/90">{text.loading}</span>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-gradient-to-br from-slate-100 to-violet-100 p-6 text-center dark:from-slate-950 dark:to-violet-950">
          <div className="max-w-sm rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/88">
            <div className="font-bold text-slate-950 dark:text-white">{text.title}</div>
            <div className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{text.text}</div>
          </div>
        </div>
      ) : null}

      {disabled ? <div className="absolute inset-0 z-20 cursor-not-allowed bg-transparent" aria-hidden="true" /> : null}
      {children}
    </div>
  );
}
