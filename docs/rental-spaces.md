# Rental business interface

Rental spaces stay in Vizit's shared directory and map, with their own registration option and 25,000 AMD monthly subscription. They use the existing login, owner/manager permissions and billing workflow. A rental profile represents one space and one calendar.

- Public profile/booking: photos and videos, description, location, hourly rate, date, duration, available start/end times and booking contact form. There is no service or employee selection.
- Customer management: the existing four-digit booking verification, a protected management link, cancellation and date/time changes.
- Workspace: a monthly calendar, manual booking and blocking forms, statuses, payment/refund records, booking history, analytics and outstanding balances.
- Setup: space price, duration limits, booking gaps, schedule, logo, cover and a media gallery. No service or staff onboarding step is required.
- Existing customer profiles remain available, with service/staff-specific fields hidden for rental owners.
- New screens use the current theme palette and support Armenian, Russian and English.

## Pairing and deployment

Deploy the paired `manucharyansos/-smartbook-api` rental branch and its migration before this frontend. Keep the existing production API URL. `npm ci && npm run build` produces the deployable `dist` contents; include its existing `.htaccess` file when uploading to Apache hosting.

The platform subscription is distinct from the rental price paid by a customer. Recording a payment/refund updates the business's records; it does not perform a bank transaction. The rental plan has no two-month annual discount.

## Validation

- TypeScript and production build.
- ESLint for the new rental components, pages and API helpers.
- `npm run verify:rentals`: renders the public form, image/video gallery, settings, onboarding, calendar, analytics and dashboard with real providers and seeded API query results.
- Paired API: 14 rental integration scenarios passed; the complete API suite passed 138 tests with one independently confirmed pre-existing social-login test failure.

The remote browser could not access the local development server. Render checks do not establish responsive layout, media playback, keyboard interaction or complete browser behavior. Verify those on a staging deployment, including a real gallery upload and booking-confirmation email, before merging/publishing. The native mobile application is outside this web change.
