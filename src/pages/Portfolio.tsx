import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Images, Trash2 } from "lucide-react";
import { PageHero } from "../components/ui/PageHero";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { fetchStaff } from "../lib/staffApi";
import { fetchServices } from "../lib/servicesApi";
import { fetchBusinessSettings } from "../lib/businessSettingsApi";
import { deletePortfolioItem, fetchPortfolio, reorderPortfolio, updatePortfolioItem, uploadPortfolioItem, type PortfolioItem, type PortfolioTags } from "../lib/portfolioApi";
import { getErrorMessage } from "../lib/http";
import { cn } from "../lib/cn";

const copy: Record<Locale, Record<string, string>> = {
    hy: {
        eyebrow: "Հանրային էջ", title: "Աշխատանքներ", intro: "Վերբեռնեք աշխատանքի լուսանկարը մեկ անգամ և նշեք մասնագետին ու ծառայությունը։ Լուսանկարը կերևա սրահի էջում, մասնագետի քարտում և ծառայության տակ, իսկ հաճախորդը լուսանկարից կարող է անմիջապես ամրագրել։",
        upload: "Ավելացնել լուսանկար", uploading: "Վերբեռնվում է…", uploadHelp: "JPG, PNG կամ WEBP, մինչև 10 ՄԲ։ Կարող եք ընտրել մի քանի լուսանկար միանգամից․ բոլորը կստանան նույն նշումները։",
        specialist: "Մասնագետ", service: "Ծառայություն", caption: "Նկարագրություն", none: "Չնշված", all: "Բոլորը",
        filter: "Ցույց տալ", empty: "Դեռ լուսանկար չկա։ Ավելացրեք առաջին աշխատանքը։", emptyFilter: "Այս ընտրությամբ լուսանկար չկա։",
        earlier: "Տեղափոխել առաջ", later: "Տեղափոխել հետ", remove: "Ջնջել", removeTitle: "Ջնջե՞լ լուսանկարը", removeText: "Լուսանկարը կհեռանա սրահի, մասնագետի և ծառայության էջերից։",
        cancel: "Չեղարկել", saved: "Պահպանվեց", uploaded: "Լուսանկարը ավելացվեց", deleted: "Լուսանկարը ջնջվեց", failed: "Չհաջողվեց պահպանել",
        loadFailed: "Չհաջողվեց բեռնել աշխատանքները", retry: "Կրկին փորձել", publicPage: "Բացել հանրային էջը", limitReached: "Հասել եք առավելագույն քանակին",
    },
    ru: {
        eyebrow: "Публичная страница", title: "Работы", intro: "Загрузите фото работы один раз и отметьте мастера и услугу. Фото появится на странице салона, в карточке мастера и под услугой, а клиент сможет записаться прямо с фото.",
        upload: "Добавить фото", uploading: "Загрузка…", uploadHelp: "JPG, PNG или WEBP, до 10 МБ. Можно выбрать несколько фото сразу — у всех будут одинаковые отметки.",
        specialist: "Мастер", service: "Услуга", caption: "Подпись", none: "Не указано", all: "Все",
        filter: "Показать", empty: "Пока нет фото. Добавьте первую работу.", emptyFilter: "Нет фото с такими отметками.",
        earlier: "Переместить вперёд", later: "Переместить назад", remove: "Удалить", removeTitle: "Удалить фото?", removeText: "Фото исчезнет со страницы салона, мастера и услуги.",
        cancel: "Отменить", saved: "Сохранено", uploaded: "Фото добавлено", deleted: "Фото удалено", failed: "Не удалось сохранить",
        loadFailed: "Не удалось загрузить работы", retry: "Повторить", publicPage: "Открыть публичную страницу", limitReached: "Достигнут лимит",
    },
    en: {
        eyebrow: "Public page", title: "Portfolio", intro: "Upload a work photo once and tag the specialist and the service. It shows on the business page, the specialist's card and under the service, and clients can book straight from the photo.",
        upload: "Add photos", uploading: "Uploading…", uploadHelp: "JPG, PNG or WEBP, up to 10 MB. You can pick several photos at once — they all get the same tags.",
        specialist: "Specialist", service: "Service", caption: "Caption", none: "Not set", all: "All",
        filter: "Show", empty: "No photos yet. Add your first work.", emptyFilter: "No photos with these tags.",
        earlier: "Move earlier", later: "Move later", remove: "Delete", removeTitle: "Delete this photo?", removeText: "The photo will disappear from the business, specialist and service pages.",
        cancel: "Cancel", saved: "Saved", uploaded: "Photo added", deleted: "Photo deleted", failed: "Could not save",
        loadFailed: "Could not load the portfolio", retry: "Try again", publicPage: "Open public page", limitReached: "Limit reached",
    },
};

const selectClass = "h-11 w-full rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-sm text-[var(--vz-text)] outline-none focus:border-[var(--vz-primary)]";

type Option = { id: number; name: string };

function TagSelect({ label, value, options, noneLabel, onChange, disabled }: { label: string; value: number | null; options: Option[]; noneLabel: string; onChange: (value: number | null) => void; disabled?: boolean }) {
    return (
        <label className="block text-xs font-medium text-[var(--vz-muted)]">
            {label}
            <select className={cn(selectClass, "mt-1")} disabled={disabled} value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
                <option value="">{noneLabel}</option>
                {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
        </label>
    );
}

export default function Portfolio() {
    const { locale } = useLanguage();
    const t = copy[locale];
    const qc = useQueryClient();
    const fileInput = useRef<HTMLInputElement>(null);

    const portfolioQ = useQuery({ queryKey: ["portfolio"], queryFn: fetchPortfolio });
    const staffQ = useQuery({ queryKey: ["staff", "portfolio"], queryFn: () => fetchStaff() });
    const servicesQ = useQuery({ queryKey: ["services", "portfolio"], queryFn: () => fetchServices() });
    const settingsQ = useQuery({ queryKey: ["business-settings"], queryFn: fetchBusinessSettings });

    const staffOptions = useMemo<Option[]>(() => (staffQ.data ?? []).filter((item) => item.is_active).map(({ id, name }) => ({ id, name })), [staffQ.data]);
    const serviceOptions = useMemo<Option[]>(() => (servicesQ.data ?? []).filter((item) => item.is_active).map(({ id, name }) => ({ id, name })), [servicesQ.data]);

    const [newTags, setNewTags] = useState<PortfolioTags>({ staff_id: null, service_id: null, caption: "" });
    const [filter, setFilter] = useState<{ staff_id: number | null; service_id: number | null }>({ staff_id: null, service_id: null });
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; text: string; type: "success" | "error" }>({ open: false, text: "", type: "success" });
    const [pendingDelete, setPendingDelete] = useState<PortfolioItem | null>(null);
    const toastTimer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(toastTimer.current), []);

    const notify = (text: string, type: "success" | "error" = "success") => {
        setToast({ open: true, text, type });
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast((old) => ({ ...old, open: false })), 2600);
    };
    const refreshPublic = () => {
        void qc.invalidateQueries({ queryKey: ["public-business-profile"] });
        void qc.invalidateQueries({ queryKey: ["public-portfolio"] });
    };
    const setItems = (items: PortfolioItem[]) => qc.setQueryData(["portfolio"], (old: { items: PortfolioItem[]; limit: number } | undefined) => ({ items, limit: old?.limit ?? 60 }));

    const items = portfolioQ.data?.items ?? [];
    const limit = portfolioQ.data?.limit ?? 60;
    const visible = items.filter((item) => (!filter.staff_id || item.staff_id === filter.staff_id) && (!filter.service_id || item.service_id === filter.service_id));
    const filtered = Boolean(filter.staff_id || filter.service_id);

    async function upload(files: FileList | null) {
        if (!files?.length) return;
        setUploading(true);
        let added = 0;
        try {
            for (const file of Array.from(files).slice(0, Math.max(0, limit - items.length))) {
                await uploadPortfolioItem(file, { ...newTags, caption: newTags.caption?.trim() || null });
                added += 1;
            }
            if (added) notify(t.uploaded);
            setNewTags((old) => ({ ...old, caption: "" }));
        } catch (error) {
            notify(getErrorMessage(error, t.failed), "error");
        } finally {
            setUploading(false);
            await qc.invalidateQueries({ queryKey: ["portfolio"] });
            refreshPublic();
        }
    }

    const update = useMutation({
        mutationFn: ({ id, tags }: { id: number; tags: PortfolioTags }) => updatePortfolioItem(id, tags),
        onSuccess: (saved) => { setItems(items.map((item) => item.id === saved.id ? saved : item)); refreshPublic(); notify(t.saved); },
        onError: (error) => notify(getErrorMessage(error, t.failed), "error"),
    });
    const reorder = useMutation({
        mutationFn: reorderPortfolio,
        onSuccess: (next) => { setItems(next); refreshPublic(); },
        onError: (error) => notify(getErrorMessage(error, t.failed), "error"),
    });
    const remove = useMutation({
        mutationFn: (id: number) => deletePortfolioItem(id),
        onSuccess: (_, id) => { setItems(items.filter((item) => item.id !== id)); setPendingDelete(null); refreshPublic(); notify(t.deleted); },
        onError: (error) => notify(getErrorMessage(error, t.failed), "error"),
    });

    function move(item: PortfolioItem, offset: number) {
        const ids = items.map((entry) => entry.id);
        const index = ids.indexOf(item.id);
        const next = index + offset;
        if (index < 0 || next < 0 || next >= ids.length) return;
        [ids[index], ids[next]] = [ids[next], ids[index]];
        reorder.mutate(ids);
    }

    const slug = settingsQ.data?.slug;
    const full = items.length >= limit;

    return (
        <div className="space-y-5 sm:space-y-6">
            <PageHero
                eyebrow={<><Images className="h-4 w-4" /> {t.eyebrow}</>}
                title={t.title}
                description={t.intro}
                actions={slug ? (
                    <Link to={`/businesses/${slug}#portfolio`} target="_blank" className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 text-sm font-semibold text-[var(--vz-text)] hover:bg-[var(--vz-surface-2)]">
                        <ExternalLink className="h-4 w-4" /> {t.publicPage}
                    </Link>
                ) : null}
            />

            <Card className="space-y-4 p-4 sm:p-6">
                <div className="grid gap-3 md:grid-cols-3">
                    <TagSelect label={t.specialist} value={newTags.staff_id ?? null} options={staffOptions} noneLabel={t.none} onChange={(value) => setNewTags((old) => ({ ...old, staff_id: value }))} />
                    <TagSelect label={t.service} value={newTags.service_id ?? null} options={serviceOptions} noneLabel={t.none} onChange={(value) => setNewTags((old) => ({ ...old, service_id: value }))} />
                    <label className="block text-xs font-medium text-[var(--vz-muted)]">
                        {t.caption}
                        <input className={cn(selectClass, "mt-1")} maxLength={255} value={newTags.caption ?? ""} onChange={(e) => setNewTags((old) => ({ ...old, caption: e.target.value }))} />
                    </label>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={t.upload}
                        onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
                    <Button type="button" loading={uploading} disabled={full || uploading} onClick={() => fileInput.current?.click()}>
                        <ImagePlus className="h-4 w-4" /> {uploading ? t.uploading : t.upload}
                    </Button>
                    <span className="text-sm text-[var(--vz-muted)]">{items.length}/{limit}{full ? ` · ${t.limitReached}` : ""}</span>
                </div>
                <p className="text-sm text-[var(--vz-text-secondary)]">{t.uploadHelp}</p>
            </Card>

            {items.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
                    <TagSelect label={`${t.filter}: ${t.specialist}`} value={filter.staff_id} options={staffOptions} noneLabel={t.all} onChange={(value) => setFilter((old) => ({ ...old, staff_id: value }))} />
                    <TagSelect label={`${t.filter}: ${t.service}`} value={filter.service_id} options={serviceOptions} noneLabel={t.all} onChange={(value) => setFilter((old) => ({ ...old, service_id: value }))} />
                </div>
            ) : null}

            {portfolioQ.isPending ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((n) => <div key={n} className="h-72 animate-pulse rounded-[22px] bg-[var(--vz-surface-2)]" />)}</div>
            ) : portfolioQ.isError ? (
                <Card className="p-6 text-center" role="alert">
                    <p className="text-sm text-[var(--vz-danger)]">{t.loadFailed}</p>
                    <Button type="button" variant="secondary" className="mt-3" onClick={() => void portfolioQ.refetch()}>{t.retry}</Button>
                </Card>
            ) : !visible.length ? (
                <Card className="p-8 text-center text-sm text-[var(--vz-muted)]">{filtered ? t.emptyFilter : t.empty}</Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((item) => {
                        const index = items.findIndex((entry) => entry.id === item.id);
                        return (
                            <Card key={item.id} className="overflow-hidden p-0">
                                {item.url ? <img src={item.url} alt={item.caption || item.service?.name || t.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : null}
                                <div className="space-y-3 p-4">
                                    <TagSelect label={t.specialist} value={item.staff_id} options={staffOptions} noneLabel={t.none} disabled={update.isPending}
                                        onChange={(value) => update.mutate({ id: item.id, tags: { staff_id: value } })} />
                                    <TagSelect label={t.service} value={item.service_id} options={serviceOptions} noneLabel={t.none} disabled={update.isPending}
                                        onChange={(value) => update.mutate({ id: item.id, tags: { service_id: value } })} />
                                    <label className="block text-xs font-medium text-[var(--vz-muted)]">
                                        {t.caption}
                                        <input className={cn(selectClass, "mt-1")} maxLength={255} defaultValue={item.caption ?? ""}
                                            onBlur={(e) => { const caption = e.target.value.trim(); if (caption !== (item.caption ?? "")) update.mutate({ id: item.id, tags: { caption: caption || null } }); }} />
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="secondary" size="sm" aria-label={t.earlier} disabled={filtered || index <= 0 || reorder.isPending} onClick={() => move(item, -1)}><ArrowLeft className="h-4 w-4" /></Button>
                                        <Button type="button" variant="secondary" size="sm" aria-label={t.later} disabled={filtered || index >= items.length - 1 || reorder.isPending} onClick={() => move(item, 1)}><ArrowRight className="h-4 w-4" /></Button>
                                        <Button type="button" variant="danger" size="sm" className="ml-auto" aria-label={t.remove} onClick={() => setPendingDelete(item)}><Trash2 className="h-4 w-4" /> {t.remove}</Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <ConfirmModal open={Boolean(pendingDelete)} title={t.removeTitle} description={t.removeText} confirmText={t.remove} cancelText={t.cancel} danger
                loading={remove.isPending} onClose={() => setPendingDelete(null)} onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)} />
            <Toast open={toast.open} text={toast.text} type={toast.type} />
        </div>
    );
}
