# Hosted bank redirect UI notes

Added routes:

- `/app/billing` – business billing page
- `/mock-bank/idbank` – mock hosted bank page
- `/payment-return` – public return page after bank redirect

Mock hosted flow:

1. Create invoice.
2. Create checkout session.
3. Frontend redirects to `/mock-bank/idbank`.
4. Mock bank page calls backend mock-complete webhook.
5. User is redirected back to `/payment-return`.
6. User can continue to `/app/billing`.
