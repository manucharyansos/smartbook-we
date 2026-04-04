import { api } from "./api";

export type PaymentTransaction = {
  id: number;
  invoice_id: number;
  provider: string;
  provider_transaction_id: string;
  payment_method: string | null;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  checkout_url?: string | null;
  checkout_payload?: {
    reference?: string;
    return_url?: string;
    cancel_url?: string;
    callback_url?: string;
    payment_page_mode?: string;
    mode?: string;
  } | null;
  paid_at?: string | null;
};

export async function createCheckoutSession(input: {
  invoice_id: number;
  provider?: "idbank" | "idbank_mock";
  payment_method?: "bank_transfer" | "idram" | "card";
}) {
  const r = await api.post("/billing/checkout-session", input);
  return r.data as {
    ok: boolean;
    redirect_required: boolean;
    redirect_method: "hosted_page";
    data: PaymentTransaction;
    provider: { name: string; mode: string; live_ready: boolean; message: string };
  };
}

export async function getInvoicePaymentStatus(invoiceId: number) {
  const r = await api.get(`/billing/invoices/${invoiceId}/payment-status`);
  return r.data as {
    data: {
      invoice: { id: number; status: string; paid_at?: string | null };
      transaction: PaymentTransaction | null;
    };
  };
}

export async function completeMockPayment(transactionId: number) {
  const r = await api.post(`/billing/transactions/${transactionId}/mock-success`);
  return r.data;
}

export async function completeHostedMockPaymentByReference(reference: string, status: "success" | "failed" | "cancelled") {
  const r = await api.post(`/webhooks/payments/idbank/mock-complete`, { reference, status });
  return r.data;
}
