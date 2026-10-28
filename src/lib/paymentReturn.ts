import type { PaymentTransaction } from "./paymentsApi";

export type VerifiedPaymentStatus = "processing" | "success" | "failed" | "cancelled" | "review";

export function verifiedPaymentStatus(
  invoice: { status: string } | null | undefined,
  transaction: PaymentTransaction | null | undefined,
  reference: string | null,
  returnHint: string | null,
): VerifiedPaymentStatus {
  if (!transaction || !reference || transaction.provider_transaction_id !== reference) return "processing";
  if (transaction.status === "paid") {
    if (transaction.requires_manual_review || !invoice || !["approved", "paid"].includes(invoice.status)) return "review";
    return "success";
  }
  if (transaction.status === "failed") return "failed";
  return returnHint === "cancelled" ? "cancelled" : "processing";
}

export function providerPaymentMethod(provider: string | undefined): "card" | "wallet" {
  return provider === "idram" ? "wallet" : "card";
}

const PENDING_CHECKOUT_KEY = "vizit.pendingCheckout";

type PendingCheckout = { reference: string; invoice_id: number; provider: string; at: number };

/** Remembers the attempt being opened so the return page can find it even if the bank sends no reference back. */
export function rememberPendingCheckout(transaction: Pick<PaymentTransaction, "provider_transaction_id" | "invoice_id" | "provider">) {
  try {
    const value: PendingCheckout = { reference: transaction.provider_transaction_id, invoice_id: transaction.invoice_id, provider: transaction.provider, at: Date.now() };
    window.localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the bank's return parameters still work.
  }
}

/** Returns the attempt opened from this browser in the last two hours, if any. */
export function readPendingCheckout(): PendingCheckout | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PENDING_CHECKOUT_KEY) ?? "null") as Partial<PendingCheckout> | null;
    if (!parsed || typeof parsed.reference !== "string" || !Number.isSafeInteger(parsed.invoice_id) || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > 2 * 60 * 60 * 1000) return null;
    return { reference: parsed.reference, invoice_id: parsed.invoice_id as number, provider: String(parsed.provider ?? ""), at: parsed.at };
  } catch {
    return null;
  }
}
