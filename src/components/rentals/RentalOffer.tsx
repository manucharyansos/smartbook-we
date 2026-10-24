import { Building2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import "../../rentals.css";

export default function RentalOffer() {
  const { locale } = useLanguage(); const t = rentalCopy[locale];
  return <section className="rental-wrap"><div className="rental-card rental-layout" style={{ marginTop: 0 }}>
    <div className="rental-stack"><Building2 size={30} /><h2>{t.title}</h2><p className="rental-muted">{locale === "hy" ? "Տարածքի վարձակալության համար՝ սեփական օրացույց, ազատ ժամեր և ամրագրում։" : locale === "ru" ? "Собственный календарь, свободные часы и бронирование помещения." : "Your space, its own calendar, available times and bookings."}</p>
      <div className="rental-price">25 000 ֏<span className="rental-muted"> / {locale === "hy" ? "ամիս" : locale === "ru" ? "месяц" : "month"}</span></div><p className="rental-muted">{t.subscriptionHelp}</p>
      <Link className="rental-btn" to="/register?type=rentals&plan=rental">{locale === "hy" ? "Գրանցել տարածքը" : locale === "ru" ? "Зарегистрировать помещение" : "Register a space"}</Link>
    </div><div className="rental-stack">{[t.calendar, t.gallery, t.analytics, t.hourly, t.workingHours].map((label) => <div className="rental-row" key={label}><Check size={18} style={{ color: "var(--vz-success)" }} />{label}</div>)}</div>
  </div></section>;
}
