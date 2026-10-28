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
