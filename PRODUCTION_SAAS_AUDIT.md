# SmartBook production SaaS audit

## What is already in place
- Frontend typecheck passes.
- Frontend production build passes.
- ESLint no longer has blocking errors; only warnings remain.
- Public booking, onboarding, staff, services, billing UI, admin area, and lazy-loaded routing are present.
- Backend already has Sanctum auth, role checks, some tenant-safety checks, seat limits, admin logs, billing invoice flow, public booking throttling, phone verification flow, queue config, and notification classes.

## Highest-priority gaps before real production rollout

### 1) Automated payment lifecycle is still incomplete
Current backend billing is mostly invoice / admin-confirmed flow.
Observed in code:
- `BillingInvoiceController` creates pending invoices and returns bank/Idram instructions.
- `BillingSubscriptionController` explicitly says cancellation is currently simple logic without provider integration.
- No payment webhook routes were found.

Needed:
- real gateway integration
- webhook endpoints
- signature verification
- idempotent payment event handling
- automatic subscription activation / renewal / failed-payment handling
- invoice proof or transaction reference reconciliation

### 2) Test coverage is too small for SaaS production
Observed:
- only a handful of tests exist (`ExampleTest`, one service CRUD feature test)

Needed:
- auth tests
- billing tests
- public booking tests
- phone verification tests
- role/permission tests
- tenant isolation tests across all main resources
- admin flows tests
- regression tests for onboarding and booking edits

### 3) Observability / incident tooling is missing
I did not find production-grade error tracking or monitoring wiring.

Needed:
- Sentry or equivalent
- structured request / job / payment logs
- uptime checks
- queue failure alerts
- admin/audit dashboards for booking failures and payment failures

### 4) Queue / async operations are not production-wired end-to-end
Observed:
- queue config exists
- queued notification class exists
- but production worker/supervisor/Horizon setup is not represented in this project delivery

Needed:
- queue worker deployment strategy
- retry / dead-letter policy
- failed jobs monitoring
- mail/SMS/WhatsApp async delivery with retry rules

### 5) Security hardening is still incomplete
Needed:
- rate limiting strategy for login / forgot password / admin login
- consistent server-side validation and authorization coverage review
- CORS / trusted origins review
- security headers / proxy / HTTPS enforcement
- secret management and env separation
- audit of token lifetime / logout behavior / refresh strategy

## Important product gaps for a real SaaS launch

### 6) Subscription operations are still manual-heavy
Needed:
- upgrade / downgrade at period end
- proration rules
- grace period / dunning
- retry failed payments
- seat overage handling rules
- subscription history timeline

### 7) Tenant operations / business support tooling need to grow
Needed:
- impersonation / support-access flow with audit trail
- soft suspension / billing lock / full suspension distinctions
- business deletion / archival policy
- export / retention policy per business

### 8) Backups and disaster recovery are not visible here
Needed:
- DB backup schedule
- restore procedure
- file storage backup plan
- recovery runbook

### 9) File/media strategy is unclear
Needed:
- production object storage (for example R2 / S3 style setup)
- signed uploads
- image optimization / limits
- CDN strategy

### 10) Release / deployment process is not shown
Needed:
- CI pipeline
- test/build gates
- migration strategy
- zero-downtime deploy process
- rollback procedure
- staging environment mirroring production

## Frontend code-quality status after this pass
- build: passing
- typecheck: passing
- lint: no blocking errors
- remaining lint warnings: mainly `any` cleanup, hook dependency refinement, and a few effect-state patterns

## Recommended next implementation order
1. payment gateway + webhook lifecycle
2. automated tests for booking / billing / auth / tenant isolation
3. monitoring + error tracking + queue operations
4. storage / backup / deployment hardening
5. remaining frontend warning cleanup and UX polish
