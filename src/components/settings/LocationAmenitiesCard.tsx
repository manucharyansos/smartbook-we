import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchBusinessSettings, updateLocationAmenities, type BusinessLocation } from "@/lib/businessSettingsApi";
import { amenityIcon, amenityLabel, amenityOptions } from "@/lib/amenities";
import { getErrorMessage } from "@/lib/http";
import { cn } from "@/lib/cn";
import type { Locale } from "@/contexts/LanguageContext";

const copy = {
    hy: {
        title: "Հարմարություններ", intro: "Նշեք, թե ինչ կա յուրաքանչյուր հասցեում։ Ընտրվածները կերևան հանրային էջում։",
        rentalIntro: "Նշեք, թե ինչ կա տարածքում, քանի մարդու համար է և որքան է մակերեսը։ Սա կերևա հանրային էջում։",
        capacity: "Քանի մարդու համար", area: "Մակերես, մ²", save: "Պահպանել", saved: "Պահպանվեց", failed: "Չհաջողվեց պահպանել",
        noLocations: "Նախ ավելացրեք հասցե։", location: "Հասցե",
    },
    ru: {
        title: "Удобства", intro: "Отметьте, что есть по каждому адресу. Выбранное будет видно на публичной странице.",
        rentalIntro: "Отметьте, что есть в помещении, на сколько человек оно рассчитано и какая площадь. Это будет видно на публичной странице.",
        capacity: "Вместимость, человек", area: "Площадь, м²", save: "Сохранить", saved: "Сохранено", failed: "Не удалось сохранить",
        noLocations: "Сначала добавьте адрес.", location: "Адрес",
    },
    en: {
        title: "Amenities", intro: "Mark what each address offers. Your choices appear on the public page.",
        rentalIntro: "Mark what the space offers, how many people it fits and its size. This appears on the public page.",
        capacity: "Capacity, people", area: "Area, m²", save: "Save", saved: "Saved", failed: "Could not save",
        noLocations: "Add an address first.", location: "Address",
    },
} as const;

type Draft = { amenities: string[]; capacity: string; area: string };

function draftFrom(location: BusinessLocation): Draft {
    return {
        amenities: location.amenities ?? [],
        capacity: location.capacity_people ? String(location.capacity_people) : "",
        area: location.area_sqm ? String(location.area_sqm) : "",
    };
}

const inputClass = "h-11 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-sm text-[var(--vz-text)] outline-none focus:border-[var(--vz-primary)]";

export default function LocationAmenitiesCard({ locale, isRental, canEdit = true }: { locale: Locale; isRental: boolean; canEdit?: boolean }) {
    const t = copy[locale];
    const settingsQ = useQuery({ queryKey: ["business-settings"], queryFn: fetchBusinessSettings });
    const locations = settingsQ.data?.locations ?? [];
    const options = settingsQ.data?.amenity_options?.length ? settingsQ.data.amenity_options : amenityOptions(isRental);

    if (settingsQ.isPending || settingsQ.isError) return null;

    return (
        <Card className="space-y-5 p-4 sm:p-6">
            <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--vz-accent-text)]">
                    <Sparkles className="h-3.5 w-3.5" /> {t.title}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--vz-text-secondary)]">{isRental ? t.rentalIntro : t.intro}</p>
            </div>
            {!locations.length ? <p className="text-sm text-[var(--vz-muted)]">{t.noLocations}</p> : locations.map((location) => (
                <LocationAmenitiesRow key={location.id} location={location} options={options} locale={locale} isRental={isRental}
                    canEdit={canEdit} showTitle={locations.length > 1} />
            ))}
        </Card>
    );
}

function LocationAmenitiesRow({ location, options, locale, isRental, canEdit, showTitle }: {
    location: BusinessLocation; options: string[]; locale: Locale; isRental: boolean; canEdit: boolean; showTitle: boolean;
}) {
    const t = copy[locale];
    const qc = useQueryClient();
    const [draft, setDraft] = useState<Draft>(() => draftFrom(location));
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    useEffect(() => { setDraft(draftFrom(location)); }, [location]);

    const save = useMutation({
        mutationFn: () => updateLocationAmenities(location.id, {
            amenities: draft.amenities,
            ...(isRental ? {
                capacity_people: draft.capacity ? Number(draft.capacity) : null,
                area_sqm: draft.area ? Number(draft.area) : null,
            } : {}),
        }),
        onSuccess: () => {
            setMessage({ ok: true, text: t.saved });
            void qc.invalidateQueries({ queryKey: ["business-settings"] });
            void qc.invalidateQueries({ queryKey: ["public-business-profile"] });
        },
        onError: (error) => setMessage({ ok: false, text: getErrorMessage(error, t.failed) }),
    });

    const toggle = (key: string) => {
        setMessage(null);
        setDraft((old) => ({ ...old, amenities: old.amenities.includes(key) ? old.amenities.filter((item) => item !== key) : [...old.amenities, key] }));
    };

    return (
        <div className="space-y-4 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
            {showTitle ? <div className="text-sm font-semibold text-[var(--vz-text)]">{location.name || location.address || t.location}</div> : null}
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.title}>
                {options.map((key) => {
                    const Icon = amenityIcon(key);
                    const active = draft.amenities.includes(key);
                    return (
                        <button key={key} type="button" aria-pressed={active} disabled={!canEdit} onClick={() => toggle(key)}
                            className={cn("inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition disabled:cursor-not-allowed",
                                active ? "border-[var(--vz-primary)] bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]" : "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text-secondary)] hover:border-[var(--vz-line-strong)]")}>
                            {active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            {amenityLabel(key, locale)}
                        </button>
                    );
                })}
            </div>
            {isRental ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-[var(--vz-muted)]">{t.capacity}
                        <input className={inputClass} inputMode="numeric" disabled={!canEdit} value={draft.capacity}
                            onChange={(e) => { setMessage(null); setDraft((old) => ({ ...old, capacity: e.target.value.replace(/\D/g, "").slice(0, 4) })); }} />
                    </label>
                    <label className="text-xs text-[var(--vz-muted)]">{t.area}
                        <input className={inputClass} inputMode="numeric" disabled={!canEdit} value={draft.area}
                            onChange={(e) => { setMessage(null); setDraft((old) => ({ ...old, area: e.target.value.replace(/\D/g, "").slice(0, 6) })); }} />
                    </label>
                </div>
            ) : null}
            {canEdit ? (
                <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" size="sm" loading={save.isPending} onClick={() => save.mutate()}><Save className="h-4 w-4" /> {t.save}</Button>
                    {message ? <span role={message.ok ? "status" : "alert"} className={cn("text-sm", message.ok ? "text-[var(--vz-success)]" : "text-[var(--vz-danger)]")}>{message.text}</span> : null}
                </div>
            ) : null}
        </div>
    );
}
