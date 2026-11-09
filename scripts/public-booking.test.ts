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

// The waitlist API accepts fewer sources than bookings do.
assert.equal(normalizeBookingSource("partner"), "partner");
assert.equal(normalizeBookingSource("partner", PUBLIC_WAITLIST_SOURCES), "website");
assert.equal(normalizeBookingSource("mobile", PUBLIC_WAITLIST_SOURCES), "website");
assert.equal(normalizeBookingSource(" Instagram", PUBLIC_WAITLIST_SOURCES), "instagram");

console.log("PASS booking ?source= normalization: case and spaces, unknown values fall back to website, waitlist list");
