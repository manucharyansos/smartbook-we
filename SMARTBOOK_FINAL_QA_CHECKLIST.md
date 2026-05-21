# SmartBook Final QA Checklist

## Public booking
- Create booking from public page
- Verify by OTP
- Ensure booking appears in business calendar same day
- Ensure same slot no longer appears free
- Cancel before start time and confirm slot refreshes
- Expired manage token should recover through OTP resend

## Business owner
- Update business hours without time format error
- Add/edit/delete location
- Add service until limit and confirm backend blocks extra service
- Add staff until limit and confirm backend blocks extra seat
- Dashboard loads today/upcoming/highlights without broken state
- Calendar create/edit/cancel works with location filter

## Roles and permissions
- Staff cannot open owner-only pages by direct URL
- Analytics API rejects non-owner/non-manager access
- Super admin can edit plan limits

## Regression checks
- Frontend typecheck
- Frontend build
- PHP syntax checks on touched controllers
- Manual check for timezone-sensitive hours (9-18 should not display 10-19)
