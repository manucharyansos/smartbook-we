import assert from "node:assert/strict";
import { keepBookingSource, normalizeBookingSource, PUBLIC_BOOKING_SOURCES, PUBLIC_WAITLIST_SOURCES } from "../src/lib/bookingSource";

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

// The rental booking page rewrites its URL after a booking and on "New booking". ?source= must survive both,
// so the next booking in the same visit is not stored as "website"; the old booking code and token are dropped.
const fromInstagram = new URLSearchParams("source=Instagram&booking=OLD1&token=secret");
assert.equal(keepBookingSource(fromInstagram, { booking: "NEW1" }).toString(), "booking=NEW1&source=Instagram");
assert.equal(keepBookingSource(fromInstagram).toString(), "source=Instagram");
assert.equal(normalizeBookingSource(keepBookingSource(fromInstagram).get("source")), "instagram");
assert.equal(keepBookingSource(new URLSearchParams("booking=OLD1&token=secret"), { booking: "NEW1" }).toString(), "booking=NEW1");
assert.equal(keepBookingSource(new URLSearchParams("source=")).toString(), "");
assert.equal(keepBookingSource(new URLSearchParams()).toString(), "");

console.log("PASS booking ?source= normalization: case and spaces, unknown values fall back to website, waitlist list, kept across rental URL changes");
