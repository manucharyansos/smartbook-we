import { cn } from "../lib/cn";

// Simplified payment-method marks. Replace the SVGs in this file with the
// official logo files from IDBank / Idram once received — the layout stays the same.

function Badge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-[64px] items-center justify-center rounded-lg border border-black/10 bg-white px-2 shadow-sm"
    >
      {children}
    </span>
  );
}

export const PAYMENT_METHODS = ["Visa", "Mastercard", "ArCa", "Idram"] as const;

export default function PaymentLogos({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Badge label="Visa">
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-hidden="true">
          <text x="24" y="13.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fontStyle="italic" fontWeight="900" fill="#1A1F71">VISA</text>
        </svg>
      </Badge>
      <Badge label="Mastercard">
        <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-hidden="true">
          <circle cx="13" cy="12" r="10" fill="#EB001B" />
          <circle cx="25" cy="12" r="10" fill="#F79E1B" />
          <path d="M19 4a10 10 0 0 1 0 16a10 10 0 0 1 0-16Z" fill="#FF5F00" />
        </svg>
      </Badge>
      <Badge label="ArCa">
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-hidden="true">
          <text x="24" y="13.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" fill="#00539B">ArCa</text>
        </svg>
      </Badge>
      <Badge label="Idram">
        <svg viewBox="0 0 52 16" className="h-4 w-auto" aria-hidden="true">
          <text x="26" y="13.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" fill="#E30613">Idram</text>
        </svg>
      </Badge>
    </div>
  );
}
