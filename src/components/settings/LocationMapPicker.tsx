import { useState } from "react";
import { Crosshair, LocateFixed, MapPin, RotateCcw } from "lucide-react";

import YandexMap, { type MapCoordinates } from "../maps/YandexMap";
import { useLanguage, type Locale } from "../../contexts/LanguageContext";

type Coordinates = { latitude: number; longitude: number };

export type LocationMapPickerLabels = {
  dragHint: string;
  zoomIn: string;
  zoomOut: string;
  unavailable: string;
  permissionError: string;
  emptyCoordinates: string;
  locating: string;
  useCurrentLocation: string;
  clear: string;
};

const defaultLabels: Record<Locale, LocationMapPickerLabels> = {
  hy: {
    dragHint: "Քաշիր քարտեզը և նշիչը դիր մուտքի վրա",
    zoomIn: "Մեծացնել քարտեզը",
    zoomOut: "Փոքրացնել քարտեզը",
    unavailable: "Սարքը չի տրամադրում ընթացիկ տեղադրությունը։",
    permissionError: "Չհաջողվեց ստանալ ընթացիկ տեղադրությունը։ Թույլատրիր տեղադրության հասանելիությունը և կրկին փորձիր։",
    emptyCoordinates: "Դիր նշիչը քարտեզի վրա․ կոորդինատները կպահպանվեն հասցեի հետ։",
    locating: "Որոշվում է…",
    useCurrentLocation: "Իմ տեղադրությունը",
    clear: "Մաքրել",
  },
  ru: {
    dragHint: "Перетащите карту и установите маркер у входа",
    zoomIn: "Увеличить карту",
    zoomOut: "Уменьшить карту",
    unavailable: "Устройство не предоставляет текущее местоположение.",
    permissionError: "Не удалось определить местоположение. Разрешите доступ и попробуйте снова.",
    emptyCoordinates: "Установите маркер на карте — координаты сохранятся вместе с адресом.",
    locating: "Определяем…",
    useCurrentLocation: "Моё местоположение",
    clear: "Очистить",
  },
  en: {
    dragHint: "Drag the map and place the marker at the entrance",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    unavailable: "This device cannot provide its current location.",
    permissionError: "We could not get your location. Allow location access and try again.",
    emptyCoordinates: "Place the marker on the map — its coordinates will be saved with the address.",
    locating: "Locating…",
    useCurrentLocation: "My location",
    clear: "Clear",
  },
};

const YEREVAN_CENTER = { latitude: 40.1772, longitude: 44.5035 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  disabled = false,
  labels,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (coordinates: Coordinates | null) => void;
  disabled?: boolean;
  labels?: Partial<LocationMapPickerLabels>;
}) {
  const { locale } = useLanguage();
  const text = { ...defaultLabels[locale], ...labels };
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const [center, setCenter] = useState<MapCoordinates>(() => hasCoordinates
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : YEREVAN_CENTER);
  const [zoom, setZoom] = useState(15);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  function commitCenter(next: MapCoordinates, nextZoom: number) {
    const coordinates = {
      latitude: Number(next.latitude.toFixed(7)),
      longitude: Number(next.longitude.toFixed(7)),
    };
    setCenter(coordinates);
    setZoom(nextZoom);
    onChange(coordinates);
  }

  function useCurrentLocation() {
    if (disabled || !navigator.geolocation) {
      setLocationError(text.unavailable);
      return;
    }

    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        };
        setCenter(next);
        setZoom(17);
        onChange(next);
        setLocating(false);
      },
      () => {
        setLocationError(text.permissionError);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <YandexMap
        center={center}
        zoom={zoom}
        disabled={disabled}
        onLocationChange={commitCenter}
        ariaLabel={text.dragHint}
        className="min-h-[280px] rounded-[22px] border border-slate-200 shadow-inner dark:border-white/10"
      >
        <div className="pointer-events-none absolute left-3 top-3 z-30 max-w-[calc(100%-112px)] rounded-2xl border border-white/70 bg-white/92 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/88 dark:text-slate-100">
          {text.dragHint}
        </div>

        <div className="absolute right-3 top-3 z-30 grid overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
          <button type="button" disabled={disabled} onClick={() => setZoom((value) => clamp(value + 1, 8, 19))} className="grid h-10 w-10 place-items-center border-b border-slate-200 text-lg font-semibold text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-white" aria-label={text.zoomIn}>+</button>
          <button type="button" disabled={disabled} onClick={() => setZoom((value) => clamp(value - 1, 8, 19))} className="grid h-10 w-10 place-items-center text-lg font-semibold text-slate-700 disabled:opacity-50 dark:text-white" aria-label={text.zoomOut}>−</button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-full">
          <div className={`grid h-12 w-12 place-items-center rounded-full border-4 border-white text-white shadow-[0_14px_35px_rgba(15,23,42,0.35)] ${hasCoordinates ? "bg-violet-600" : "bg-slate-700"}`}>
            <MapPin className="h-6 w-6" />
          </div>
          <div className={`mx-auto h-3 w-3 -translate-y-1 rotate-45 border-b-4 border-r-4 border-white ${hasCoordinates ? "bg-violet-600" : "bg-slate-700"}`} />
        </div>
        <Crosshair className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
      </YandexMap>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hasCoordinates
            ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
            : text.emptyCoordinates}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled || locating} onClick={useCurrentLocation} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
            <LocateFixed className="h-4 w-4" /> {locating ? text.locating : text.useCurrentLocation}
          </button>
          {hasCoordinates ? (
            <button type="button" disabled={disabled} onClick={() => { setCenter(YEREVAN_CENTER); setZoom(15); onChange(null); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-rose-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              <RotateCcw className="h-4 w-4" /> {text.clear}
            </button>
          ) : null}
        </div>
      </div>
      {locationError ? <div className="mt-2 text-xs leading-5 text-rose-600">{locationError}</div> : null}
    </div>
  );
}
