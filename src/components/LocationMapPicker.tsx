import { MapPin } from "lucide-react";

import { useLanguage } from "../contexts/LanguageContext";
import { LocationMapPicker as YandexLocationMapPicker } from "./settings/LocationMapPicker";

function parseCoordinate(value: string | number | null | undefined): number | null {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

type Props = {
  latitude: string;
  longitude: string;
  onChange: (latitude: string, longitude: string) => void;
  address?: string;
  disabled?: boolean;
  compact?: boolean;
};

const copy = {
  hy: { latitude: "Լայնություն (latitude)", longitude: "Երկայնություն (longitude)", address: "Ընտրված հասցե", empty: "Հասցեն դեռ լրացված չէ" },
  ru: { latitude: "Широта (latitude)", longitude: "Долгота (longitude)", address: "Выбранный адрес", empty: "Адрес ещё не заполнен" },
  en: { latitude: "Latitude", longitude: "Longitude", address: "Selected address", empty: "The address has not been entered" },
} as const;

export default function LocationMapPicker({ latitude, longitude, onChange, address, disabled = false, compact = false }: Props) {
  const { locale } = useLanguage();
  const text = copy[locale];
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-[var(--vz-text-secondary)]">
          <span>{text.latitude}</span>
          <input value={latitude} disabled={disabled} inputMode="decimal" onChange={(event) => onChange(event.target.value, longitude)} placeholder="40.1772000" className="h-12 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 text-sm text-[var(--vz-text)] outline-none transition focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-focus)] disabled:opacity-60 dark:focus:ring-[var(--vz-focus)]" />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-[var(--vz-text-secondary)]">
          <span>{text.longitude}</span>
          <input value={longitude} disabled={disabled} inputMode="decimal" onChange={(event) => onChange(latitude, event.target.value)} placeholder="44.5035000" className="h-12 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 text-sm text-[var(--vz-text)] outline-none transition focus:border-[var(--vz-primary)] focus:ring-4 focus:ring-[var(--vz-focus)] disabled:opacity-60 dark:focus:ring-[var(--vz-focus)]" />
        </label>
      </div>

      <YandexLocationMapPicker
        latitude={parsedLatitude}
        longitude={parsedLongitude}
        disabled={disabled}
        onChange={(coordinates) => onChange(
          coordinates?.latitude.toFixed(7) ?? "",
          coordinates?.longitude.toFixed(7) ?? "",
        )}
      />

      <div className={`flex items-center gap-2 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-xs text-[var(--vz-text-secondary)] ${compact ? "text-[11px]" : ""}`}>
        <MapPin className="h-4 w-4 text-[var(--vz-accent-text)] dark:text-violet-300" />
        <span><strong>{text.address}:</strong> {address || text.empty}</span>
      </div>
    </div>
  );
}
