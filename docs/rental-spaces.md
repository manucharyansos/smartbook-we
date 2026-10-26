# Rental business interface

Rental spaces stay in Vizit's shared directory and map, with their own registration option and 25,000 AMD monthly subscription. They use the existing login, owner/manager permissions and billing workflow. A rental profile represents one space and one calendar.

- Public profile (`/businesses/:slug`): logo, cover, description, contact details, working hours, photo/video gallery and a link to booking. This page has no booking form.
- Public booking (`/book/:slug`): date, duration in minutes/hours/days, available start/end times, total and booking contact form. There is no service or employee selection. A visible link returns to the profile.
- Customer management: the existing four-digit booking verification, a protected management link, cancellation and date/time changes.
- Workspace: a monthly calendar, manual booking and blocking forms, statuses, payment/refund records, booking history, analytics and outstanding balances.
- Setup: space price, duration limits, booking gaps, schedule, logo, cover and a media gallery. No service or staff onboarding step is required.
- Logo and cover uploads immediately persist and enable their public display. Gallery entries also persist on upload. Profile, booking and directory queries are invalidated after updates.
- Existing customer profiles remain available, with service/staff-specific fields hidden for rental owners.
- New screens use the current theme palette and support Armenian, Russian and English.
- Home and pricing plan selectors list services, healthcare and rentals. Selecting rentals shows only its API-backed plan. Monthly/yearly controls belong to each fixed-price card and update that card independently; rental annual pricing uses 12 paid months and no two-month gift. The separate rental-price block was removed from these two pages.

## Flexible rental periods

Customers choose the duration themselves within the owner's minimum, maximum and time step. Quick choices include 2 hours, 5 hours and 3 days when the settings allow them. A day means 24 continuous hours, billed at the existing hourly rate. The chosen start and full end date/time are displayed before submission.

Owners can set limits up to 30 days and enable overnight/multi-day rentals. When enabled, arrival and return must fall within available hours; the whole stay, including closed nights, is held. Existing spaces keep this option disabled. Without it, the whole rental must fit a continuous open interval. To enable 3-day stays on the demo, increase its current 6-hour maximum to at least 3 days and enable overnight rentals.

Availability checks reservations, live confirmation holds, explicit blocks and buffers across the entire interval. The server rechecks inside the existing business-row transaction lock. Multi-day bookings appear on every occupied calendar day; a midnight end is exclusive.

## Pairing and deployment

Deploy the paired `manucharyansos/-smartbook-api` rental branch and its migration before this frontend. Keep the existing production API URL. `npm ci && npm run build` produces the deployable `dist` contents; include its existing `.htaccess` file when uploading to Apache hosting.

The platform subscription is distinct from the rental price paid by a customer. Recording a payment/refund updates the business's records; it does not perform a bank transaction. The rental plan has no two-month annual discount.

The paired API also provides `php artisan rental:setup-demo thest-vizit-demo-space --owner-email=sos.evistep@gmail.com` for the existing authorized demo. This installs bundled demo images and enables 1-hour–7-day rentals without a browser login. It verifies the demo and owner and preserves accounts, bookings and existing media.

## Validation

- TypeScript and production build.
- ESLint for the new rental components, pages and API helpers.
- `npm run verify:rentals`: renders the public form, image/video gallery, settings, onboarding, calendar, analytics and dashboard with real providers and seeded API query results.
- Paired API: 28 rental integration scenarios passed; the complete API suite passed 154 tests. The former social-login fixture was corrected to use a registered customer, with an additional refusal test for unregistered logins; authentication behavior is unchanged.

The remote browser could not access the local development server. Render checks do not establish responsive layout, media playback, keyboard interaction or complete browser behavior. Verify those on a staging deployment, including a real gallery upload and booking-confirmation email, before merging/publishing. The native mobile application is outside this web change.
