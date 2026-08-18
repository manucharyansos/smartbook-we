import { useMemo, useRef, type MouseEvent } from "react";
import { MapPin } from "lucide-react";

const DEFAULT_LAT = 40.1772;
const DEFAULT_LNG = 44.50349;
const ZOOM = 15;
const TILE_SIZE = 256;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseCoordinate(value: string | number | null | undefined): number | null {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function lonToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number) {
  const safeLat = clamp(lat, -85.05112878, 85.05112878);
  const radians = (safeLat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * 2 ** zoom;
}

function tileXToLng(x: number, zoom: number) {
  return (x / 2 ** zoom) * 360 - 180;
}

function tileYToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

type Props = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  address?: string;
  disabled?: boolean;
  compact?: boolean;
};

export default function LocationMapPicker({ latitude, longitude, onChange, address, disabled = false, compact = false }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const parsedLat = parseCoordinate(latitude);
  const parsedLng = parseCoordinate(longitude);
  const hasCoordinates = parsedLat !== null && parsedLng !== null;
  const centerLat = parsedLat ?? DEFAULT_LAT;
  const centerLng = parsedLng ?? DEFAULT_LNG;

  const tiles = useMemo(() => {
    const centerX = lonToTileX(centerLng, ZOOM);
    const centerY = latToTileY(centerLat, ZOOM);
    const maxTile = 2 ** ZOOM;
    const result: Array<{ key: string; url: string; left: number; top: number }> = [];

    for (let dx = -3; dx <= 3; dx += 1) {
      for (let dy = -2; dy <= 2; dy += 1) {
        const rawX = Math.floor(centerX) + dx;
        const y = Math.floor(centerY) + dy;
        if (y < 0 || y >= maxTile) continue;
        const x = ((rawX % maxTile) + maxTile) % maxTile;
        result.push({
          key: `${ZOOM}-${x}-${y}`,
          url: `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`,
          left: (rawX - centerX) * TILE_SIZE,
          top: (y - centerY) * TILE_SIZE,
        });
      }
    }

    return result;
  }, [centerLat, centerLng]);

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    if (disabled || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const deltaX = event.clientX - rect.left - rect.width / 2;
    const deltaY = event.clientY - rect.top - rect.height / 2;
    const nextTileX = lonToTileX(centerLng, ZOOM) + deltaX / TILE_SIZE;
    const nextTileY = latToTileY(centerLat, ZOOM) + deltaY / TILE_SIZE;
    const nextLat = clamp(tileYToLat(nextTileY, ZOOM), -90, 90);
    const nextLng = clamp(tileXToLng(nextTileX, ZOOM), -180, 180);
    onChange(nextLat.toFixed(7), nextLng.toFixed(7));
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>Լայնություն (latitude)</span>
          <input
            value={latitude}
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value, longitude)}
            placeholder="40.1772000"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:ring-violet-500/15"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span>Երկայնություն (longitude)</span>
          <input
            value={longitude}
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) => onChange(latitude, event.target.value)}
            placeholder="44.5035000"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:ring-violet-500/15"
          />
        </label>
      </div>

      <div
        ref={mapRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleMapClick}
        onKeyDown={(event) => {
          if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
          event.preventDefault();
          onChange(centerLat.toFixed(7), centerLng.toFixed(7));
        }}
        className={`relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-900 shadow-sm outline-none ring-violet-300 transition focus:ring-4 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-crosshair"} ${compact ? "min-h-[210px]" : "min-h-[250px]"}`}
        aria-label="Քարտեզի վրա ընտրել բիզնեսի տեղանքը"
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.url}
            alt=""
            loading="lazy"
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/30" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <div className={`grid place-items-center rounded-full border border-white/40 bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-[0_16px_44px_rgba(0,0,0,0.35)] ${hasCoordinates ? "h-12 w-12" : "h-10 w-10 opacity-70"}`}>
            <MapPin className="h-5 w-5" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/20 bg-slate-950/80 px-4 py-3 text-white backdrop-blur-xl">
          <div className="text-xs font-bold text-cyan-100">Սեղմիր քարտեզին՝ ճիշտ կետը նշելու համար</div>
          <div className="mt-1 truncate text-sm font-semibold">{address || "Հասցեն դեռ լրացված չէ"}</div>
          <div className="mt-1 text-[11px] text-slate-300">
            {hasCoordinates ? `${parsedLat!.toFixed(6)}, ${parsedLng!.toFixed(6)}` : "Կետը դեռ նշված չէ"}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
        <span>Քարտեզում երևալու համար հասցեն և կոորդինատները պետք է պահպանված լինեն։</span>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2 hover:text-violet-700">© OpenStreetMap</a>
      </div>
    </div>
  );
}
