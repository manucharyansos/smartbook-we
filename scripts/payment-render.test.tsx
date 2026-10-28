import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PaymentReturn from "../src/pages/PaymentReturn";
import Billing from "../src/pages/Billing";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { useAuth } from "../src/store/auth";
import { providerPaymentMethod, verifiedPaymentStatus } from "../src/lib/paymentReturn";
import type { PaymentTransaction } from "../src/lib/paymentsApi";

const transaction: PaymentTransaction = { id: 1, invoice_id: 10, provider: "idram", provider_transaction_id: "pay_test", payment_method: "wallet", amount: 10, currency: "AMD", status: "pending" };
assert.equal(providerPaymentMethod("idram"), "wallet");
assert.equal(providerPaymentMethod("idbank"), "card");
assert.equal(verifiedPaymentStatus(undefined, undefined, "pay_test", "success"), "processing");
assert.equal(verifiedPaymentStatus({ status: "pending" }, transaction, "pay_test", "success"), "processing");
assert.equal(verifiedPaymentStatus({ status: "approved" }, { ...transaction, status: "paid" }, "pay_test", "failed"), "success");
assert.equal(verifiedPaymentStatus({ status: "approved" }, { ...transaction, status: "paid" }, "other_reference", "success"), "processing");
assert.equal(verifiedPaymentStatus({ status: "cancelled" }, { ...transaction, status: "paid", requires_manual_review: true }, "pay_test", "success"), "review");
assert.equal(verifiedPaymentStatus({ status: "pending" }, transaction, "pay_test", "cancelled"), "cancelled");
assert.equal(verifiedPaymentStatus({ status: "pending" }, { ...transaction, status: "failed" }, "pay_test", "success"), "failed");

function render(Component: React.ComponentType, route: string, cache: QueryClient) {
  return renderToString(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={cache}><LanguageProvider><Component /></LanguageProvider></QueryClientProvider></MemoryRouter>);
}
useAuth.setState({ user: null });
let client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
let html = render(PaymentReturn, "/payment-return?provider=idram&status=success", client);
assert.match(html, /data-payment-return="unverified"/);
assert.doesNotMatch(html, /data-payment-return="success"/);
html = render(PaymentReturn, "/payment-return?provider=idram&invoice_id=10&reference=pay_test&status=success", client);
assert.match(html, /data-payment-return="processing"/);
assert.doesNotMatch(html, /data-payment-return="success"/);

client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
client.setQueryData(["billing", "me"], { business: { id: 1, business_type: "beauty" }, is_billable: false, reason: null, subscription: null, payment_provider: { default: "idram", live_ready: true, checkout_available: true }, usage: {}, seats: {} });
client.setQueryData(["plans", "billing-page", "beauty"], []);
client.setQueryData(["billing", "invoices"], [{ id: 10, amount: 10, currency: "AMD", status: "pending", created_at: "2026-10-28T10:00:00Z" }]);
html = render(Billing, "/app/billing", client);
assert.match(html, /Idram դրամապանակ/);
assert.match(html, /Վճարել Idram-ով/);
assert.match(html, /src="\/payments\/idram.png"/);
assert.doesNotMatch(html, /IDBank Live|IDBank Test/);
console.log("PASS payment state validation, provider selection and billing/return rendering");
