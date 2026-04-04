# Phase 2B — Technical implementation map (SmartBook)

Սա կառուցված է ըստ ներկայիս repo-ների կառուցվածքի՝ Laravel API + React Web.

## 1) DB schema
**Tables**
- `plans`
  - `code` (starter/pro/business)
  - `price_beauty`, `price_dental`, `currency`
  - `staff_limit`, `locations`
  - `features` (json)
- `subscriptions`
  - `business_id`, `plan_id`, `status`
  - trial/current period fields
  - `plan_snapshot` (json) — ֆիքսում ենք plan-ի վիճակը subscription-ի պահին

**Booking blocks**
- `booking_blocks`
  - `business_id`
  - `staff_id` nullable (null = business-wide)
  - `starts_at`, `ends_at`
  - `reason` (break/day-off/holiday/custom)

## 2) Backend guards / middleware
- `EnsureBusinessContext` (եթե business չկա՝ 403/redirect)
- `EnsureBusinessIsBillable` (trial expired -> 402 + message)
- `EnsureSeatAvailable` (staff create limit)
- `EnsureFeatureEnabled($featureKey)`
  - reads subscription snapshot (`$business->activeSubscription()`)
  - checks `features[$key] === true` կամ numeric limits

## 3) Feature flags mapping
**Starter**
- blocks ✅
- analytics ❌
- export ❌
- rooms ❌
- online_booking ❌

**Pro**
- blocks ✅
- analytics ✅
- export ✅
- rooms ❌
- online_booking ✅

**Business/Clinic**
- blocks ✅
- analytics ✅
- export ✅
- rooms ✅
- online_booking ✅
- reminders ✅

## 4) API routing (suggested)
- `/api/plans` (public)
- `/api/billing/subscription` (current)
- `/api/billing/checkout` (create/upgrade)
- Feature-gated endpoints
  - `/api/analytics/*` -> `EnsureFeatureEnabled:analytics`
  - `/api/rooms/*` -> `EnsureFeatureEnabled:rooms`
  - `/api/export/*` -> `EnsureFeatureEnabled:export`

## 5) Frontend UI gating
- `Billing` page shows plans + current subscription
- Each feature section checks `useAuth().features` (from `/api/me`)
  - if locked -> show “Upgrade to unlock” CTA
- For Staff limit
  - Staff page disables “Add staff” when `active >= limit`

## 6) Production readiness checklist
- `.env` sanity: APP_URL, SANCTUM_STATEFUL_DOMAINS, CORS
- queue/cron (reminders later)
- logging + Sentry (optional)
- backups
- DB migrations run in CI/CD
