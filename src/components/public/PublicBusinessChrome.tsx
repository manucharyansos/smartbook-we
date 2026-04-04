import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Globe2, MapPin, MessageCircleMore, Phone } from "lucide-react";
import type { PublicBusiness } from "../../lib/publicApi";

function businessTypeLabel(type?: "beauty" | "dental") {
  return type === "dental" ? "Կլինիկա" : "Բիզնես էջ";
}

function formatWorkHours(start?: string | null, end?: string | null) {
  if (!start || !end) return "Տես ամրագրման ժամերը";
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function PublicBusinessHeader({
  business,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  business?: Partial<PublicBusiness> | null;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/88 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <div className="min-w-0 flex items-center gap-3">
          <Link to={secondaryHref || "/"} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:h-11 sm:w-11">
            {business ? <ArrowLeft className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
          </Link>
          <div className="min-w-0 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm sm:h-11 sm:w-11">
              {business?.logo_url ? (
                <img src={business.logo_url} alt={business?.name || "Business"} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center"><CalendarDays className="h-4 w-4" /></div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-950 sm:text-base">{business?.name || "SmartBook"}</div>
              <div className="truncate text-xs text-slate-500">{business ? businessTypeLabel(business.business_type) : "Ամրագրման միջավայր"}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to={secondaryHref || "/"} className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex">
            {secondaryLabel || "Գլխավոր"}
          </Link>
          {primaryHref && primaryLabel ? (
            <Link to={primaryHref} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-5">
              {primaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function PublicBusinessFooter({ business }: { business?: PublicBusiness | null }) {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              SmartBook-ի աջակցությամբ
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{business?.name || "Բիզնես էջ"}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{business?.short_description || "Ամրագրում, կոնտակտ և բիզնեսի հիմնական տվյալները մեկ էջում։"}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              {business?.address ? <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"><MapPin className="h-3.5 w-3.5" />{business.address}</span> : null}
              {Array.isArray(business?.locations) && business.locations.length > 1 ? <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-violet-700"><MapPin className="h-3.5 w-3.5" />{business.locations.length} հասցե</span> : null}
              {business?.phone ? <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"><Phone className="h-3.5 w-3.5" />{business.phone}</span> : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"><Clock3 className="h-3.5 w-3.5" />{formatWorkHours(business?.work_start, business?.work_end)}</span>
            </div>
            {Array.isArray(business?.locations) && business.locations.length > 1 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {business.locations.map((location) => (
                  <div key={location.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <div className="font-medium text-slate-900">{location.name || (location.is_primary ? 'Գլխավոր հասցե' : 'Մասնաճյուղ')}</div>
                    <div className="mt-1 leading-6">{location.address}</div>
                    {location.phone ? <div className="mt-1 text-xs text-slate-500">{location.phone}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {business?.website_url ? <a href={business.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><Globe2 className="h-4 w-4" /> Կայք</a> : null}
            {business?.messenger_url ? <a href={business.messenger_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><MessageCircleMore className="h-4 w-4" /> Messenger</a> : null}
            {business?.whatsapp_url ? <a href={business.whatsapp_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><MessageCircleMore className="h-4 w-4" /> WhatsApp</a> : null}
            <Link to={business?.slug ? `/book/${business.slug}` : "/"} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Ամրագրել հիմա</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
