import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import type { RentalDiscount } from "../../lib/rentalApi";

/** Lists the owner's duration discounts, e.g. "3 hours: −5%". */
export default function RentalDiscounts({ discounts }: { discounts?: RentalDiscount[] }) {
  const { locale } = useLanguage();
  const t = rentalCopy[locale];
  if (!discounts?.length) return null;
  const hours = (minutes: number) => (minutes / 60).toLocaleString(locale === "hy" ? "hy-AM" : locale, { maximumFractionDigits: 2 });
  return <div className="rental-note"><strong>{t.discounts}</strong>
    <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{[...discounts].sort((a, b) => a.min_minutes - b.min_minutes)
      .map((tier) => <li key={tier.min_minutes}>{t.discountTier(hours(tier.min_minutes), tier.percent)}</li>)}</ul>
  </div>;
}
