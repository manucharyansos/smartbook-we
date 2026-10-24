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
export function rentalLocalStamp(value: string, locale: string): string {
  const [date, time] = value.split(" ");
  return new Date(`${date}T${time}:00Z`).toLocaleString(locale === "hy" ? "hy-AM" : locale, { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" });
}

/** Booking ends are exclusive: a midnight return does not occupy the following day. */
export function rentalOverlapsDay(booking: { starts_at: string; ends_at: string }, day: string, timezone: string): boolean {
  const format = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  return format.format(new Date(booking.starts_at)) <= day && format.format(new Date(new Date(booking.ends_at).getTime() - 1)) >= day;
}
