import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crosshair, LocateFixed, MapPin, RotateCcw } from "lucide-react";

type Coordinates = { latitude: number; longitude: number };
type MapTile = { key: string; left: number; top: number; url: string };

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

const defaultLabels: LocationMapPickerLabels = {
  dragHint: "Քաշիր քարտեզը և նշիչը դիր մուտքի վրա",
  zoomIn: "Մեծացնել քարտեզը",
  zoomOut: "Փոքրացնել քարտեզը",
  unavailable: "Սարքը չի տրամադրում ընթացիկ տեղադրությունը։",
  permissionError: "Չհաջողվեց ստանալ ընթացիկ տեղադրությունը։ Թույլատրիր location access-ը և կրկին փորձիր։",
  emptyCoordinates: "Դիր նշիչը քարտեզի վրա․ կոորդինատները կպահպանվեն հասցեի հետ։",
  locating: "Որոշվում է…",
  useCurrentLocation: "Իմ տեղադրությունը",
  clear: "Մաքրել",
};

const YEREVAN_CENTER = { latitude: 40.1772, longitude: 44.5035 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function longitudeToTileX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 2 ** zoom;
}

function latitudeToTileY(latitude: number, zoom: number) {
  const safeLatitude = clamp(latitude, -85.05112878, 85.05112878);
  const radians = (safeLatitude * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 2 ** zoom;
}

function tileXToLongitude(x: number, zoom: number) {
  return (x / 2 ** zoom) * 360 - 180;
}

function tileYToLatitude(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function buildTiles(center: Coordinates, zoom: number) {
  const centerX = longitudeToTileX(center.longitude, zoom);
  const centerY = latitudeToTileY(center.latitude, zoom);
  const tiles: MapTile[] = [];

  for (let dx = -3; dx <= 3; dx += 1) {
    for (let dy = -3; dy <= 3; dy += 1) {
      const rawX = Math.floor(centerX) + dx;
      const y = Math.floor(centerY) + dy;
      const tileCount = 2 ** zoom;
      if (y < 0 || y >= tileCount) continue;
      const x = ((rawX % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        left: (rawX - centerX) * 256,
        top: (y - centerY) * 256,
        url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
      });
    }
  }

  return tiles;
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
  const text = { ...defaultLabels, ...labels };
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const [center, setCenter] = useState<Coordinates>(() => hasCoordinates
    ? { latitude: Number(latitude), longitude: Number(longitude) }
    : YEREVAN_CENTER);
  const [zoom, setZoom] = useState(15);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    centerX: number;
    centerY: number;
    zoom: number;
  } | null>(null);
  const centerRef = useRef(center);
  const tiles = useMemo(() => buildTiles(center, zoom), [center, zoom]);

  function updateCenter(next: Coordinates) {
    centerRef.current = next;
    setCenter(next);
  }

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || (event.target as HTMLElement).closest("button,a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      centerX: longitudeToTileX(center.longitude, zoom),
      centerY: latitudeToTileY(center.latitude, zoom),
      zoom,
    };
  }

  function moveMap(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const nextX = drag.centerX - (event.clientX - drag.startX) / 256;
    const nextY = drag.centerY - (event.clientY - drag.startY) / 256;
    updateCenter({
      latitude: clamp(tileYToLatitude(nextY, drag.zoom), -85, 85),
      longitude: tileXToLongitude(nextX, drag.zoom),
    });
  }

  function finishDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
    dragRef.current = null;
    onChange({
      latitude: Number(centerRef.current.latitude.toFixed(7)),
      longitude: Number(centerRef.current.longitude.toFixed(7)),
    });
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
        updateCenter(next);
        setZoom(17);
        onChange(next);
        setLocating(false);
      },
      () => {
        setLocationError(text.permissionError);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div
        className={`relative min-h-[280px] touch-none overflow-hidden rounded-[22px] border border-slate-200 bg-slate-200 shadow-inner ${disabled ? "cursor-not-allowed opacity-70" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={beginDrag}
        onPointerMove={moveMap}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className="absolute inset-0 bg-slate-200" />
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-slate-900/10" />

        <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-112px)] rounded-2xl border border-white/70 bg-white/92 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur">
          {text.dragHint}
        </div>

        <div className="absolute right-3 top-3 z-20 grid overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-lg backdrop-blur">
          <button type="button" disabled={disabled} onClick={() => setZoom((value) => clamp(value + 1, 8, 18))} className="grid h-10 w-10 place-items-center border-b border-slate-200 text-lg font-semibold text-slate-700 disabled:opacity-50" aria-label={text.zoomIn}>+</button>
          <button type="button" disabled={disabled} onClick={() => setZoom((value) => clamp(value - 1, 8, 18))} className="grid h-10 w-10 place-items-center text-lg font-semibold text-slate-700 disabled:opacity-50" aria-label={text.zoomOut}>−</button>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-full">
          <div className={`grid h-12 w-12 place-items-center rounded-full border-4 border-white text-white shadow-[0_14px_35px_rgba(15,23,42,0.35)] ${hasCoordinates ? "bg-violet-600" : "bg-slate-700"}`}>
            <MapPin className="h-6 w-6" />
          </div>
          <div className="mx-auto h-3 w-3 -translate-y-1 rotate-45 border-b-4 border-r-4 border-white bg-inherit" />
        </div>
        <Crosshair className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white/90" />

        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
          © OpenStreetMap
        </a>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-slate-500">
          {hasCoordinates
            ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
            : text.emptyCoordinates}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled || locating} onClick={useCurrentLocation} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50">
            <LocateFixed className="h-4 w-4" /> {locating ? text.locating : text.useCurrentLocation}
          </button>
          {hasCoordinates ? (
            <button type="button" disabled={disabled} onClick={() => { updateCenter(YEREVAN_CENTER); setZoom(15); onChange(null); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-rose-600 disabled:opacity-50">
              <RotateCcw className="h-4 w-4" /> {text.clear}
            </button>
          ) : null}
        </div>
      </div>
      {locationError ? <div className="mt-2 text-xs leading-5 text-rose-600">{locationError}</div> : null}
    </div>
  );
}
