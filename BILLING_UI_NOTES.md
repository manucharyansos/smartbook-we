# Billing UI Notes

The Billing page now reflects the new payment lifecycle:

- Plan selection creates an invoice
- Checkout session creates a payment transaction
- Mock success simulates the provider callback
- Status panel reflects invoice + transaction state

When the real IdBank API is available, the page should keep the same UX. Only the backend provider adapter and secrets should change.
