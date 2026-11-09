// `?source=` on a booking link tells the business where the booking came from,
// e.g. /book/<slug>?source=instagram.
// These lists mirror the API's `source` rules. The API check is case-sensitive and
// rejects the whole booking (422) for any other value, so keep them in sync with it.

// PublicBookingController: store, storeMulti, storeLines.
export const PUBLIC_BOOKING_SOURCES = ["website", "mobile", "instagram", "facebook", "whatsapp", "widget", "partner", "qr"] as const;

// WaitlistController::publicStore accepts a shorter list.
export const PUBLIC_WAITLIST_SOURCES = ["website", "widget", "instagram", "facebook", "whatsapp", "qr"] as const;

const DEFAULT_SOURCE = "website";

/** Trims and lowercases a hand-typed source; anything the API would reject becomes "website". */
export function normalizeBookingSource(raw: string | null | undefined, allowed: readonly string[] = PUBLIC_BOOKING_SOURCES): string {
  const value = (raw ?? "").trim().toLowerCase();
  return allowed.includes(value) ? value : DEFAULT_SOURCE;
}
