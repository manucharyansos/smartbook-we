import { Maximize2, Sparkles, Users } from "lucide-react";
import type { PublicLocation } from "@/lib/publicApi";
import { amenityIcon, amenityLabel } from "@/lib/amenities";
import type { Locale } from "@/contexts/LanguageContext";

const copy = {
    hy: { title: "Հարմարություններ", capacity: "մինչև {n} մարդ", area: "{n} մ²", main: "Գլխավոր հասցե", branch: "Մասնաճյուղ" },
    ru: { title: "Удобства", capacity: "до {n} человек", area: "{n} м²", main: "Основной адрес", branch: "Филиал" },
    en: { title: "Amenities", capacity: "up to {n} people", area: "{n} m²", main: "Main address", branch: "Branch" },
} as const;

function hasDetails(location: PublicLocation) {
    return Boolean(location.amenities?.length || location.capacity_people || location.area_sqm);
}

export default function AmenitiesSection({ locations, locale, className = "" }: { locations?: PublicLocation[]; locale: Locale; className?: string }) {
    const t = copy[locale];
    const withDetails = (locations ?? []).filter(hasDetails);
    if (!withDetails.length) return null;
    const showNames = (locations ?? []).length > 1;

    return (
        <section id="amenities" aria-labelledby="amenities-title" className={`vizit-profile-section rounded-[32px] border border-white/70 bg-[var(--vz-surface)] p-5 shadow-sm dark:border-white/10 sm:p-7 ${className}`}>
            <div className="vizit-profile-section-badge inline-flex items-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                <Sparkles className="h-4 w-4" />
                <h2 id="amenities-title">{t.title}</h2>
            </div>
            <div className="mt-5 space-y-4">
                {withDetails.map((location) => (
                    <div key={location.id}>
                        {showNames ? <div className="mb-2 text-sm font-semibold text-[var(--vz-text)]">{location.name || (location.is_primary ? t.main : t.branch)}{location.address ? <span className="font-normal text-[var(--vz-muted)]"> · {location.address}</span> : null}</div> : null}
                        <ul className="flex flex-wrap gap-2">
                            {location.capacity_people ? (
                                <li className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 text-sm text-[var(--vz-text-secondary)]">
                                    <Users className="h-4 w-4 text-[var(--vz-brand-text)]" /> {t.capacity.replace("{n}", String(location.capacity_people))}
                                </li>
                            ) : null}
                            {location.area_sqm ? (
                                <li className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 text-sm text-[var(--vz-text-secondary)]">
                                    <Maximize2 className="h-4 w-4 text-[var(--vz-brand-text)]" /> {t.area.replace("{n}", String(location.area_sqm))}
                                </li>
                            ) : null}
                            {(location.amenities ?? []).map((key) => {
                                const Icon = amenityIcon(key);
                                return (
                                    <li key={key} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 text-sm text-[var(--vz-text-secondary)]">
                                        <Icon className="h-4 w-4 text-[var(--vz-brand-text)]" /> {amenityLabel(key, locale)}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
