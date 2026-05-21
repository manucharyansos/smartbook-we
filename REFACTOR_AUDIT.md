# Refactor Audit

## Done in this patch
- Removed all `Sonline*` naming from the web project.
- Split Calendar page UI into separate components under `src/components/calendar/`.
- Cleaned Calendar header/toolbar structure and responsive layout.
- Kept Calendar logic working while moving reusable UI out of `src/pages/Calendar.tsx`.
- Fixed `src/App.tsx` unused default React import.

## New Calendar components
- `src/components/calendar/BookingDetailsDrawer.tsx`
- `src/components/calendar/CalendarBlockModal.tsx`
- `src/components/calendar/CalendarDesktopDayColumns.tsx`
- `src/components/calendar/CalendarFiltersModal.tsx`
- `src/components/calendar/CalendarHeader.tsx`
- `src/components/calendar/CalendarMobileSchedule.tsx`
- `src/components/calendar/CreateField.tsx`
- `src/components/calendar/ModeCard.tsx`
- `src/components/calendar/SmartSlotPicker.tsx`
- `src/components/calendar/types.ts`
- `src/components/calendar/utils.ts`

## Remaining oversized files that should be refactored next
- `src/pages/PublicBooking.tsx`
- `src/components/clients/DentalHistoryPanel.tsx`
- `src/pages/BusinessSettings.tsx`
- `src/pages/Index.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Staff.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/Services.tsx`
- `src/pages/Register.tsx`

## Current project typecheck status
The Calendar refactor itself is clean, but global `npm run typecheck` still fails because of pre-existing dental client API/type mismatches in:
- `src/components/clients/DentalHistoryPanel.tsx`
- `src/lib/clientsApi.ts`

Those errors were already outside Calendar and need a separate API/types cleanup.
