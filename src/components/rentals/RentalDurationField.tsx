import { useId, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { rentalDurationFactors, rentalDurationLabel, validRentalDuration, type RentalDurationUnit } from "../../lib/rentalTime";

type Props = { value: number; onChange: (minutes: number) => void; min: number; max: number; step: number; label?: string; presets?: boolean };

export default function RentalDurationField({ value, onChange, min, max, step, label, presets = false }: Props) {
  const { locale } = useLanguage(); const t = rentalCopy[locale]; const id = useId();
  const [unit, setUnit] = useState<RentalDurationUnit>(() => value > 0 && value % 1440 === 0 ? "days" : value % 60 === 0 ? "hours" : "minutes");
  // When the value changes from outside (e.g. picking an end day on the calendar), show it in whole days.
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setUnit(value > 0 && value % 1440 === 0 ? "days" : value % 60 === 0 ? "hours" : "minutes");
  }
  const emit = (minutes: number) => { setSynced(minutes); onChange(minutes); };
  const factor = rentalDurationFactors[unit];
  const amount = Math.round(value / factor * 1000000) / 1000000;
  const valid = validRentalDuration(value, min, max, step);
  const options: [RentalDurationUnit, string][] = [["minutes", t.minutes], ["hours", t.hours], ["days", t.days]];
  return <div className="rental-field rental-duration">
    <label htmlFor={id}>{label || t.duration}</label>
    <div className="rental-duration-inputs">
      <input id={id} type="number" inputMode="decimal" value={value > 0 ? amount : ""} min={min / factor} max={max / factor} step="any" required
        aria-invalid={!valid} aria-describedby={`${id}-help`}
        onChange={(event) => emit(Math.round(Number(event.target.value) * factor * 1000000) / 1000000)} />
      <select aria-label={`${label || t.duration} · ${t.unit}`} value={unit} onChange={(event) => { const next = event.target.value as RentalDurationUnit; setUnit(next); emit(Math.round(amount * rentalDurationFactors[next] * 1000000) / 1000000); }}>
        {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </div>
    <small id={`${id}-help`} className={valid ? "rental-muted" : "rental-duration-error"}>
      {t.allowedDuration}: {rentalDurationLabel(min, t)} – {rentalDurationLabel(max, t)} · {t.durationStep}: {step} {t.minutes}
    </small>
    {presets && <div className="rental-row rental-duration-presets">{[120, 300, 4320].filter((n) => validRentalDuration(n, min, max, step)).map((n) => <button key={n} className="rental-btn secondary" type="button" aria-pressed={value === n} onClick={() => { setUnit(n % 1440 === 0 ? "days" : "hours"); emit(n); }}>{rentalDurationLabel(n, t)}</button>)}</div>}
  </div>;
}
