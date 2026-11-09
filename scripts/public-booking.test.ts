import { SHARE_LINK_SOURCES, withBookingSource } from "../src/lib/bookingSource";
import assert from "node:assert/strict";
import { normalizeBookingSource, PUBLIC_BOOKING_SOURCES, PUBLIC_WAITLIST_SOURCES } from "../src/lib/bookingSource";

// Hand-typed ?source= values: case and spaces are fixed.
assert.equal(normalizeBookingSource("instagram"), "instagram");
assert.equal(normalizeBookingSource("Instagram"), "instagram");
assert.equal(normalizeBookingSource(" facebook "), "facebook");
assert.equal(normalizeBookingSource("WhatsApp"), "whatsapp");
for (const source of PUBLIC_BOOKING_SOURCES) assert.equal(normalizeBookingSource(source.toUpperCase()), source);

// Values the API would reject fall back to "website" instead of failing the booking.
assert.equal(normalizeBookingSource("tiktok"), "website");
assert.equal(normalizeBookingSource("business_profile"), "website");
assert.equal(normalizeBookingSource(""), "website");
assert.equal(normalizeBookingSource("   "), "website");
assert.equal(normalizeBookingSource(null), "website");
assert.equal(normalizeBookingSource(undefined), "website");

// Copy buttons on the settings page: each tagged link keeps its source for bookings and the waitlist.
assert.deepEqual([...SHARE_LINK_SOURCES], ["instagram", "facebook", "whatsapp"]);
for (const source of SHARE_LINK_SOURCES) {
  const link = withBookingSource("https://vizit.am/book/demo-salon", source);
  assert.equal(link, `https://vizit.am/book/demo-salon?source=${source}`);
  const sent = new URL(link).searchParams.get("source");
  assert.equal(normalizeBookingSource(sent), source);
  assert.equal(normalizeBookingSource(sent, PUBLIC_WAITLIST_SOURCES), source);
}

// The waitlist API accepts fewer sources than bookings do.
assert.equal(normalizeBookingSource("partner"), "partner");
assert.equal(normalizeBookingSource("partner", PUBLIC_WAITLIST_SOURCES), "website");
assert.equal(normalizeBookingSource("mobile", PUBLIC_WAITLIST_SOURCES), "website");
assert.equal(normalizeBookingSource(" Instagram", PUBLIC_WAITLIST_SOURCES), "instagram");

console.log("PASS booking ?source= normalization: case and spaces, unknown values fall back to website, waitlist list");
