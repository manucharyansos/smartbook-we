import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NotebookText, Pencil, Phone, RotateCcw, Save, Scissors, X } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/cn";
import type { Booking, BookingStatus } from "../../lib/calendarApi";
import type { Service } from "../../lib/servicesApi";
import type { StaffUser } from "../../lib/staffApi";
import type { BookingEditorPayload } from "./types";
import { CreateField } from "./CreateField";
import {
    bookingSourceLabel,
    bookingSourceTone,
    bookingStatusLabel,
    bookingStatusTone,
    formatDateTimeLabel,
    hm,
    parseLocalDateTime,
    ymd,
} from "./utils";

export function BookingDetailsDrawer({
    booking,
    serviceById,
    staffById,
    options,
    onClose,
    onChoose,
    onUpdate,
    onShift,
    saving = false,
}: {
    booking: Booking | null;
    serviceById: Map<number, Service>;
    staffById: Map<number, StaffUser>;
    options: Array<{ key: string; title: string; description?: string; danger?: boolean }>;
    onClose: () => void;
    onChoose: (key: string) => void;
    onUpdate: (payload: BookingEditorPayload) => void;
    onShift: (booking: Booking, deltaMinutes: number) => void;
    saving?: boolean;
}) {
    const items = booking?.items?.length
        ? booking.items
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((item) => ({
                  id: item.id,
                  name: item.service?.name ?? serviceById.get(item.service_id)?.name ?? `Service #${item.service_id}`,
                  duration: item.duration_minutes ?? item.service?.duration_minutes ?? 0,
                  price: item.price ?? item.service?.price ?? null,
              }))
        : booking
          ? [{
                id: booking.id,
                name: serviceById.get(booking.service_id)?.name ?? `Service #${booking.service_id}`,
                duration: serviceById.get(booking.service_id)?.duration_minutes ?? 0,
                price: serviceById.get(booking.service_id)?.price ?? null,
            }]
          : [];

    const totalPrice = items.reduce((sum, item) => sum + Number(item.price ?? 0), 0);
    const staffName = booking?.staff_id ? staffById.get(booking.staff_id)?.name : null;
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        client_name: "",
        client_phone: "",
        notes: "",
        status: "confirmed" as BookingStatus,
        staff_id: "" as number | "",
        date: "",
        time: "",
    });

    useEffect(() => {
        if (!booking) return;
        const dt = parseLocalDateTime(booking.starts_at);
        setEditing(false);
        setForm({
            client_name: booking.client_name ?? "",
            client_phone: booking.client_phone ?? "",
            notes: booking.notes ?? "",
            status: booking.status,
            staff_id: booking.staff_id ?? "",
            date: dt ? ymd(dt) : "",
            time: dt ? hm(dt) : "",
        });
    }, [booking]);

    function saveEdit() {
        if (!booking || !form.client_name.trim() || !form.client_phone.trim() || !form.date || !form.time) return;
        onUpdate({
            id: booking.id,
            client_name: form.client_name.trim(),
            client_phone: form.client_phone.trim(),
            notes: form.notes.trim() || null,
            status: form.status,
            staff_id: form.staff_id ? Number(form.staff_id) : null,
            starts_at: `${form.date} ${form.time}`,
        });
    }

    return (
        <AnimatePresence>
            {booking ? (
                <>
                    <motion.button
                        type="button"
                        className="fixed inset-0 z-40 bg-white/45"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        initial={{ x: 420, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 420, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-hidden border-l border-slate-200 bg-[#fbfaf8] shadow-[0_18px_48px_rgba(15,23,42,0.12)] sm:max-w-[460px]"
                    >
                        <div className="border-b border-slate-200 bg-[#faf8f4] px-5 py-5 text-slate-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Booking details</div>
                                    <div className="mt-2 text-2xl font-semibold tracking-tight">{booking.client_name}</div>
                                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                        <Phone className="h-4 w-4" /> {booking.client_phone}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setEditing((v) => !v)} className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-white/15" title={editing ? "Չեղարկել խմբագրումը" : "Խմբագրել"}>
                                        {editing ? <RotateCcw className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
                                    </button>
                                    <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition hover:bg-white/15">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", bookingStatusTone(booking.status))}>{bookingStatusLabel(booking.status)}</span>
                                {staffName ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{staffName}</span> : null}
                                <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", bookingSourceTone(booking.source))}>{bookingSourceLabel(booking.source)}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            {editing ? (
                                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-950">Խմբագրել ամրագրումը</div>
                                            <div className="mt-1 text-xs text-slate-500">Փոխիր հաճախորդին, ժամը, աշխատակցին կամ status-ը առանց էջից դուրս գալու։</div>
                                        </div>
                                        <Button size="sm" onClick={saveEdit} loading={saving}><Save className="h-4 w-4" /> Պահպանել</Button>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <CreateField label="Հաճախորդի անուն"><input value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Հեռախոս"><input value={form.client_phone} onChange={(e) => setForm((p) => ({ ...p, client_phone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Ամսաթիվ"><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Ժամ"><input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                        <CreateField label="Աշխատակից"><select value={form.staff_id} onChange={(e) => setForm((p) => ({ ...p, staff_id: e.target.value ? Number(e.target.value) : "" }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="">Առանց ընտրության</option>{Array.from(staffById.values()).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></CreateField>
                                        <CreateField label="Status"><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BookingStatus }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="done">Done</option><option value="cancelled">Cancelled</option><option value="no_show">No-show</option></select></CreateField>
                                    </div>
                                    <CreateField label="Նշումներ"><textarea rows={4} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {[{ delta: -30, label: "-30ր" }, { delta: -15, label: "-15ր" }, { delta: 15, label: "+15ր" }, { delta: 30, label: "+30ր" }].map((step) => (
                                            <Button key={step.label} variant="secondary" size="sm" onClick={() => onShift(booking, step.delta)}>{step.label}</Button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-0 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Սկիզբ</div>
                                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatDateTimeLabel(booking.starts_at)}</div>
                                </div>
                                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ավարտ</div>
                                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatDateTimeLabel(booking.ends_at)}</div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Scissors className="h-4 w-4 text-violet-600" /> Ծառայություններ</div>
                                <div className="mt-4 space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-medium text-slate-900">{item.name}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{item.duration} րոպե</div>
                                                </div>
                                                {item.price != null ? <div className="text-sm font-semibold text-violet-700">{item.price} AMD</div> : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">Ընդհանուր արժեքը՝ {totalPrice} AMD</div>
                            </div>

                            {booking.notes ? (
                                <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><NotebookText className="h-4 w-4 text-slate-600" /> Նշումներ</div>
                                    <div className="mt-3 text-sm leading-6 text-slate-600">{booking.notes}</div>
                                </div>
                            ) : null}

                            <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="text-sm font-semibold text-slate-950">Արագ գործողություններ</div>
                                <div className="mt-4 grid gap-3">
                                    {options.map((option) => (
                                        <button key={option.key} type="button" onClick={() => onChoose(option.key)} className={cn("rounded-2xl border px-4 py-3 text-left transition", option.danger ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50")}>
                                            <div className="font-medium">{option.title}</div>
                                            {option.description ? <div className="mt-1 text-xs text-current/70">{option.description}</div> : null}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            ) : null}
        </AnimatePresence>
    );
}
