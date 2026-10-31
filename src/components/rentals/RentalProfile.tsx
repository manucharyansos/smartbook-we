import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import type { PublicBusiness } from "../../lib/publicApi";
import { rentalDurationLabel } from "../../lib/rentalTime";
import RentalDiscounts from "./RentalDiscounts";
import { safeExternalUrl } from "../../lib/support";
import { PublicBusinessFooter, PublicBusinessHeader } from "../public/PublicBusinessChrome";
import RentalGallery from "./RentalGallery";
import Seo from "../Seo";
import "../../rentals.css";
import { localizedText } from "@/lib/localizedText";

export default function RentalProfile({ business }: { business: PublicBusiness }) {
  const { locale } = useLanguage(); const t = rentalCopy[locale]; const rates = business.rental;
  const bookHref = `/book/${business.slug}`;
  const socials = [[t.website, business.website_url], ["Instagram", business.instagram_url], ["Facebook", business.facebook_url], ["WhatsApp", business.whatsapp_url]];
  return <div className="rental-page rental-profile">
    <Seo title={`${business.name} · ${t.title}`} description={localizedText(business, "short_description", locale) || localizedText(business, "description", locale) || t.aboutSpace} canonical={`/businesses/${business.slug}`} />
    <PublicBusinessHeader business={business} primaryHref={bookHref} primaryLabel={t.book} secondaryHref="/" secondaryLabel="Vizit" />
    <main className="rental-wrap">
      <section className="rental-profile-hero">
        {business.cover_url && business.show_cover !== false ? <img className="rental-profile-cover" src={business.cover_url} alt={`${business.name} · ${t.cover}`} /> : <div className="rental-profile-cover rental-profile-cover-empty"><Building2 size={64} aria-hidden="true" /></div>}
        <div className="rental-profile-heading">
          {business.logo_url && business.show_logo !== false ? <img className="rental-logo" src={business.logo_url} alt={`${business.name} · ${t.logo}`} /> : <div className="rental-logo rental-profile-logo-empty"><Building2 size={32} aria-hidden="true" /></div>}
          <div><span className="rental-badge">{t.title}</span><h1>{business.name}</h1>{localizedText(business, "short_description", locale) && <p className="rental-muted">{localizedText(business, "short_description", locale)}</p>}</div>
        </div>
      </section>
      <div className="rental-layout">
        <div className="rental-stack">
          <section className="rental-card rental-stack"><h2>{t.aboutSpace}</h2>
            {localizedText(business, "description", locale) && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{localizedText(business, "description", locale)}</p>}
            {business.address && <p className="rental-row"><MapPin size={18} aria-hidden="true" />{business.address}</p>}
            {business.phone && <a className="rental-row" href={`tel:${business.phone}`}><Phone size={18} aria-hidden="true" />{business.phone}</a>}
            <div className="rental-row">{socials.map(([label, value]) => { const href = safeExternalUrl(value); return href ? <a key={label} className="rental-btn secondary" href={href} target="_blank" rel="noopener noreferrer">{label}</a> : null; })}</div>
          </section>
          <section className="rental-card rental-stack" id="gallery"><h2>{t.gallery}</h2>{business.gallery?.length ? <RentalGallery items={business.gallery} /> : <p className="rental-muted">{t.emptyGallery}</p>}</section>
        </div>
        <aside className="rental-stack">
          <section className="rental-card rental-stack">
            <span className="rental-row"><CalendarDays size={20} aria-hidden="true" />{t.book}</span>
            {rates?.hourly_price != null && <div><strong className="rental-price">{rates.hourly_price.toLocaleString(locale === "hy" ? "hy-AM" : locale)} ֏</strong><p className="rental-muted">{t.hourly}</p></div>}
            {rates && <p className="rental-muted">{t.allowedDuration}: {rentalDurationLabel(rates.min_minutes, t)} – {rentalDurationLabel(rates.max_minutes, t)}</p>}
            <p className="rental-muted">{t.availabilityHelp}</p>
            <RentalDiscounts discounts={rates?.duration_discounts} />
            {rates?.allow_overnight && <p className="rental-note">{t.overnightPublic}</p>}
            <Link className="rental-btn rental-full" to={bookHref}>{t.chooseDateTime}<ArrowRight size={18} aria-hidden="true" /></Link>
          </section>
          <section className="rental-card rental-stack"><h2 className="rental-row"><Clock3 size={20} aria-hidden="true" />{t.workingHours}</h2>
            {business.working_hours?.length ? <dl className="rental-profile-hours">{business.working_hours.map((day) => <div key={day.weekday}><dt>{t.weekdays[day.weekday - 1]}</dt><dd>{day.is_closed ? t.closed : day.start === day.end ? t.allDay : `${day.start?.slice(0, 5)} – ${day.end?.slice(0, 5)}`}{!day.is_closed && day.break_start && day.break_end && <small>{t.breakTime}: {day.break_start.slice(0, 5)} – {day.break_end.slice(0, 5)}</small>}</dd></div>)}</dl>
              : business.work_start && business.work_end ? <p>{business.work_start.slice(0, 5)} – {business.work_end.slice(0, 5)}</p> : null}
            <p className="rental-muted">{t.timezone}: {business.timezone || "Asia/Yerevan"}</p>
          </section>
        </aside>
      </div>
      <div className="rental-profile-mobile-book"><Link className="rental-btn rental-full" to={bookHref}>{t.book}<ArrowRight size={18} aria-hidden="true" /></Link></div>
    </main><PublicBusinessFooter business={business} compact />
  </div>;
}
