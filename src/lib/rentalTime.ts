export type RentalDurationUnit = "minutes" | "hours" | "days";
export const rentalDurationFactors: Record<RentalDurationUnit, number> = { minutes: 1, hours: 60, days: 1440 };

export function validRentalDuration(minutes: number, min: number, max: number, step: number): boolean {
  return Number.isInteger(minutes) && minutes >= min && minutes <= max && minutes % step === 0;
}

export function rentalDurationLabel(minutes: number, labels: { days: string; hours: string; minutes: string }): string {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const rest = minutes % 60;
  return [days ? `${days} ${labels.days}` : "", hours ? `${hours} ${labels.hours}` : "", rest ? `${rest} ${labels.minutes}` : ""].filter(Boolean).join(" ") || `0 ${labels.minutes}`;
}

/** Date strings returned by availability are already in the business's local time. */
const HY_SHORT_MONTHS = ["հունվ.", "փետր.", "մարտ", "ապր.", "մայիս", "հունիս", "հուլիս", "օգոստ.", "սեպտ.", "հոկտ.", "նոյ.", "դեկտ."];

export function rentalLocalStamp(value: string, locale: string): string {
  const [date, time] = value.split(" ");
  // Browsers often lack Armenian month names and fall back to another language.
  if (locale === "hy") {
    const [year, month, day] = date.split("-").map(Number);
    return `${day} ${HY_SHORT_MONTHS[month - 1]} ${year}, ${time}`;
  }
  return new Date(`${date}T${time}:00Z`).toLocaleString(locale, { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" });
}

/** Booking ends are exclusive: a midnight return does not occupy the following day. */
export function rentalOverlapsDay(booking: { starts_at: string; ends_at: string }, day: string, timezone: string): boolean {
  const format = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  return format.format(new Date(booking.starts_at)) <= day && format.format(new Date(new Date(booking.ends_at).getTime() - 1)) >= day;
}

/** Adds whole days to a YYYY-MM-DD key without timezone drift. */
export function addDateKeyDays(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function dateKeyDiffDays(from: string, to: string): number {
  const toUtc = (key: string) => { const [y, m, d] = key.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((toUtc(to) - toUtc(from)) / 86400000);
}

/**
 * Last calendar day the rental occupies. With a chosen start time the slot's end decides
 * (a midnight return does not occupy the next day); before that, whole days are counted.
 */
export function rentalRangeEnd(startDate: string, minutes: number, slot?: { ends_at: string } | null): string {
  if (slot) {
    const day = slot.ends_at.slice(0, 10);
    return slot.ends_at.slice(11, 16) === "00:00" && day > startDate ? addDateKeyDays(day, -1) : day;
  }
  return minutes >= 1440 ? addDateKeyDays(startDate, Math.floor(minutes / 1440)) : startDate;
}

/** Start times that fall inside the chosen period (shown in a softer colour). */
export function rentalSlotWithin(slot: { starts_at: string }, selected?: { starts_at: string; ends_at: string } | null): boolean {
  // Only for a same-day booking; for several days the calendar shows the period instead.
  return !!selected && selected.ends_at.slice(0, 10) === selected.starts_at.slice(0, 10)
    && slot.starts_at > selected.starts_at && slot.starts_at < selected.ends_at;
}
