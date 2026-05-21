import { Filter } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { cn } from "../../lib/cn";
import type { Service } from "../../lib/servicesApi";
import type { StaffUser } from "../../lib/staffApi";

export function CalendarFiltersModal({
    open,
    onClose,
    canManageAllBookings,
    staff,
    staffFilter,
    setStaffFilter,
    services,
    serviceFilter,
    setServiceFilter,
    resetFilters,
}: {
    open: boolean;
    onClose: () => void;
    canManageAllBookings: boolean;
    staff: StaffUser[];
    staffFilter: number[];
    setStaffFilter: React.Dispatch<React.SetStateAction<number[]>>;
    services: Service[];
    serviceFilter: number[];
    setServiceFilter: React.Dispatch<React.SetStateAction<number[]>>;
    resetFilters: () => void;
}) {
    return (
        <Modal open={open} onClose={onClose} title="Ֆիլտրեր">
            <div className="space-y-4">
                {canManageAllBookings ? (
                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Աշխատակիցներ</div>
                        <div className="flex flex-wrap gap-2">{staff.map((s) => { const active = staffFilter.includes(s.id); return <button key={s.id} type="button" onClick={() => setStaffFilter((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))} className={cn("rounded-full border px-3 py-2 text-sm transition", active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-700")}>{s.name}</button>; })}</div>
                    </div>
                ) : <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">Staff mode-ում ֆիլտրը սահմանված է քո վրա և չի փոխվում։</div>}
                <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ծառայություններ</div>
                    <div className="flex flex-wrap gap-2">{services.map((s) => { const active = serviceFilter.includes(s.id); return <button key={s.id} type="button" onClick={() => setServiceFilter((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]))} className={cn("rounded-full border px-3 py-2 text-sm transition", active ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-700")}>{s.name}</button>; })}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2"><Button onClick={resetFilters}>Մաքրել</Button><Button variant="secondary" onClick={onClose}><Filter className="h-4 w-4" /> Փակել</Button></div>
            </div>
        </Modal>
    );
}
