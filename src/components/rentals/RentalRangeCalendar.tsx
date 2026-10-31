import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const WEEKDAYS = {
  hy: ["Երկ", "Երք", "Չրք", "Հնգ", "Ուրբ", "Շբթ", "Կիր"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
} as const;
const HY_MONTHS = ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"];
const copy = {
  hy: { prev: "Նախորդ ամիս", next: "Հաջորդ ամիս", pickStart: "Նշեք սկզբի օրը", pickEnd: "Հիմա նշեք ավարտի օրը (կամ նույն օրը՝ ժամերով վարձակալության համար)", start: "Սկիզբ", end: "Ավարտ" },
  ru: { prev: "Предыдущий месяц", next: "Следующий месяц", pickStart: "Выберите день начала", pickEnd: "Теперь выберите день окончания (или тот же день для почасовой аренды)", start: "Начало", end: "Окончание" },
  en: { prev: "Previous month", next: "Next month", pickStart: "Choose the start day", pickEnd: "Now choose the end day (or the same day for an hourly rental)", start: "Start", end: "End" },
} as const;
const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  start: string;
  end: string;
  minDate: string;
  maxDate?: string;
  /** Multi-day ranges are allowed only when the space accepts overnight rentals. */
  allowRange: boolean;
  /** end is null while the visitor still has to pick the end day. */
  onChange: (start: string, end: string | null) => void;
};

export default function RentalRangeCalendar({ start, end, minDate, maxDate, allowRange, onChange }: Props) {
  const { locale } = useLanguage();
  const t = copy[locale];
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [hover, setHover] = useState<string | null>(null);
  const [month, setMonth] = useState(() => { const [y, m] = (start || minDate).split("-").map(Number); return { y, m: m - 1 }; });

  const cells = useMemo(() => {
    const lead = (new Date(Date.UTC(month.y, month.m, 1)).getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
    return [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => `${month.y}-${pad(month.m + 1)}-${pad(i + 1)}`)];
  }, [month]);

  const label = locale === "hy" ? `${HY_MONTHS[month.m]} ${month.y}` : new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(month.y, month.m, 1)));
  const shift = (delta: number) => setMonth((current) => { const d = new Date(Date.UTC(current.y, current.m + delta, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const canPrev = `${month.y}-${pad(month.m + 1)}` > minDate.slice(0, 7);
  const canNext = !maxDate || `${month.y}-${pad(month.m + 1)}` < maxDate.slice(0, 7);

  // While choosing the end day, preview the range up to the hovered day.
  const shownEnd = picking === "end" && hover && hover >= start ? hover : end;

  function pick(day: string) {
    if (!allowRange || picking === "start" || day < start) {
      onChange(day, allowRange ? null : day);
      setPicking(allowRange ? "end" : "start");
      return;
    }
    onChange(start, day);
    setPicking("start");
  }

  return <div className="rental-calendar" onMouseLeave={() => setHover(null)}>
    <div className="rental-calendar-head">
      <button type="button" className="rental-calendar-nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t.prev}><ChevronLeft size={18} /></button>
      <strong>{label}</strong>
      <button type="button" className="rental-calendar-nav" onClick={() => shift(1)} disabled={!canNext} aria-label={t.next}><ChevronRight size={18} /></button>
    </div>
    <div className="rental-calendar-grid" role="grid">
      {WEEKDAYS[locale].map((w) => <span key={w} className="rental-calendar-weekday">{w}</span>)}
      {cells.map((day, index) => {
        if (!day) return <span key={`e${index}`} />;
        const disabled = day < minDate || (!!maxDate && day > maxDate);
        const isStart = day === start;
        const isEnd = day === shownEnd && shownEnd !== start;
        const within = !!shownEnd && day > start && day < shownEnd;
        const cls = ["rental-calendar-day", isStart && "is-start", isEnd && "is-end", within && "is-within", isStart && shownEnd && shownEnd > start && "has-range"].filter(Boolean).join(" ");
        return <button key={day} type="button" className={cls} disabled={disabled} onClick={() => pick(day)} onMouseEnter={() => setHover(day)}
          aria-pressed={isStart || isEnd} aria-label={`${day}${isStart ? ` · ${t.start}` : ""}${isEnd ? ` · ${t.end}` : ""}`}>
          {Number(day.slice(8))}
        </button>;
      })}
    </div>
    {allowRange ? <p className="rental-muted rental-calendar-hint">{picking === "end" ? t.pickEnd : t.pickStart}</p> : null}
  </div>;
}
