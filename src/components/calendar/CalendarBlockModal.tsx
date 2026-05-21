import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { cn } from "../../lib/cn";
import type { StaffUser } from "../../lib/staffApi";
import type { DraftBlock } from "./types";
import { CreateField } from "./CreateField";

export function CalendarBlockModal({
    open,
    onClose,
    blockDraft,
    setBlockDraft,
    staff,
    submitBlock,
    pending,
}: {
    open: boolean;
    onClose: () => void;
    blockDraft: DraftBlock;
    setBlockDraft: React.Dispatch<React.SetStateAction<DraftBlock>>;
    staff: StaffUser[];
    submitBlock: () => void;
    pending: boolean;
}) {
    return (
        <Modal open={open} onClose={onClose} title="Ավելացնել block / փակ ժամ">
            <div className="space-y-4">
                <CreateField label="Scope">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <button type="button" onClick={() => setBlockDraft((p) => ({ ...p, scope: "business" }))} className={cn("rounded-2xl border px-4 py-3 text-sm transition", blockDraft.scope === "business" ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white")}>Ամբողջ business</button>
                        <button type="button" onClick={() => setBlockDraft((p) => ({ ...p, scope: "staff" }))} className={cn("rounded-2xl border px-4 py-3 text-sm transition", blockDraft.scope === "staff" ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white")}>Միայն staff</button>
                    </div>
                </CreateField>
                {blockDraft.scope === "staff" ? <CreateField label="Աշխատակից"><select value={blockDraft.staffId} onChange={(e) => setBlockDraft((p) => ({ ...p, staffId: e.target.value ? Number(e.target.value) : "" }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="">Ընտրիր...</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></CreateField> : null}
                <div className="grid gap-4 sm:grid-cols-2"><CreateField label="Ամսաթիվ"><input type="date" value={blockDraft.date} onChange={(e) => setBlockDraft((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField><CreateField label="Տեսակ"><select value={blockDraft.mode} onChange={(e) => setBlockDraft((p) => ({ ...p, mode: e.target.value as DraftBlock['mode'] }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"><option value="duration">Ժամային block</option><option value="allday">Ամբողջ օր</option></select></CreateField></div>
                {blockDraft.mode === "duration" ? <div className="grid gap-4 sm:grid-cols-2"><CreateField label="Սկիզբ"><input type="time" value={blockDraft.startTime} onChange={(e) => setBlockDraft((p) => ({ ...p, startTime: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField><CreateField label="Տևողություն (րոպե)"><input type="number" min={1} value={blockDraft.durationMin} onChange={(e) => setBlockDraft((p) => ({ ...p, durationMin: Number(e.target.value) || 1 }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField></div> : null}
                <CreateField label="Պատճառ"><input value={blockDraft.reason} onChange={(e) => setBlockDraft((p) => ({ ...p, reason: e.target.value }))} placeholder="Օր․ Ընդմիջում / Հանգիստ" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" /></CreateField>
                <div className="grid gap-3 sm:grid-cols-2"><Button onClick={submitBlock} disabled={pending || !blockDraft.date || (blockDraft.scope === "staff" && !blockDraft.staffId && staff.length > 0)}>{pending ? "Պահպանում է…" : "Պահպանել block"}</Button><Button variant="secondary" onClick={onClose}>Փակել</Button></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-600">• Block-ը կարող է լինել staff-ի կամ ամբողջ business-ի համար • Mobile/day view-ում block-ը tap անելով կարող ես ջնջել</div>
            </div>
        </Modal>
    );
}
