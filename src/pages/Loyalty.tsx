import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Star, Plus, Minus, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { page } from "../lib/motion";

type Program = {
  id: number; business_id: number; is_enabled: boolean; currency_unit: number; points_per_currency_unit: number; min_booking_amount: number; notes?: string | null;
};
type ClientRow = { id: number; name: string; phone: string | null; points: number };

async function fetchProgram(): Promise<Program> { const r = await api.get("/loyalty/program"); return r.data.data as Program; }
async function updateProgram(payload: Partial<Program>): Promise<Program> { const r = await api.put("/loyalty/program", payload); return r.data.data as Program; }
async function fetchClients(q: string): Promise<ClientRow[]> { const r = await api.get("/loyalty/clients", { params: q ? { q } : {} }); return r.data.data as ClientRow[]; }
async function adjustClient(clientId: number, delta_points: number, reason?: string) { const r = await api.post(`/loyalty/clients/${clientId}/adjust`, { delta_points, reason }); return r.data.data; }

export default function Loyalty() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openAdjust, setOpenAdjust] = useState<null | ClientRow>(null);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState("");

  const programQ = useQuery({ queryKey: ["loyalty", "program"], queryFn: fetchProgram });
  const clientsQ = useQuery({ queryKey: ["loyalty", "clients", q], queryFn: () => fetchClients(q) });
  const saveProgram = useMutation({ mutationFn: updateProgram, onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty"] }) });
  const adjustMut = useMutation({ mutationFn: (p: { id: number; delta: number; reason?: string }) => adjustClient(p.id, p.delta, p.reason), onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty", "clients"] }) });

  const program = programQ.data;
  const summary = useMemo(() => program ? `${program.points_per_currency_unit} միավոր / ${program.currency_unit} դրամ` : null, [program]);

  return (
    <motion.div {...page} className="space-y-6">
      <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" /> Լոյալության համակարգ
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Հաճախորդների լոյալության ծրագիր</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">Ավտոմատ միավորներ booking-ներից, ձեռքով կարգավորում և հաճախորդների պահպանում ավելի խելացի մեխանիկայով։</p>
          </div>
          {summary ? <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">{summary}</div> : null}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[28px] p-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Star className="h-5 w-5" /> Ծրագրի կարգավորումներ</div>
          {programQ.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Բեռնում է...</div> : program ? (
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-600">Միավորներ յուրաքանչյուր դրամի համար<Input type="number" className="mt-2" value={program.points_per_currency_unit} onChange={(e) => qc.setQueryData(["loyalty", "program"], { ...program, points_per_currency_unit: Number(e.target.value) || 0 })} /></label>
              <label className="block text-sm text-slate-600">Դրամի միավոր<Input type="number" className="mt-2" value={program.currency_unit} onChange={(e) => qc.setQueryData(["loyalty", "program"], { ...program, currency_unit: Number(e.target.value) || 0 })} /></label>
              <label className="block text-sm text-slate-600">Նվազագույն ամրագրման գումար<Input type="number" className="mt-2" value={program.min_booking_amount} onChange={(e) => qc.setQueryData(["loyalty", "program"], { ...program, min_booking_amount: Number(e.target.value) || 0 })} /></label>
              <label className="block text-sm text-slate-600">Նշումներ<Input className="mt-2" value={program.notes ?? ""} onChange={(e) => qc.setQueryData(["loyalty", "program"], { ...program, notes: e.target.value })} /></label>
              <div className="flex items-center justify-end">
                <Button onClick={() => saveProgram.mutate(program)} className="rounded-2xl">{saveProgram.isPending ? <Spinner size={16} /> : "Պահպանել"}</Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="rounded-[28px] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Gift className="h-5 w-5" /> Հաճախորդների միավորներ</div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Փնտրել հաճախորդ" className="pl-9" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {clientsQ.isLoading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Բեռնում է...</div> : (clientsQ.data ?? []).map((client) => (
              <div key={client.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{client.name}</div>
                  <div className="text-sm text-slate-500">{client.phone || "Հեռախոս չկա"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">{client.points} միավոր</div>
                  <Button variant="secondary" className="rounded-2xl" onClick={() => { setOpenAdjust(client); setDelta(0); setReason(""); }}>Կարգավորել</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={!!openAdjust} onClose={() => setOpenAdjust(null)} title="Կարգավորել միավորները">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="rounded-2xl gap-2" onClick={() => setDelta((v) => v + 1)}><Plus className="h-4 w-4" /> Ավելացնել</Button>
            <Button variant="secondary" className="rounded-2xl gap-2" onClick={() => setDelta((v) => v - 1)}><Minus className="h-4 w-4" /> Պակասեցնել</Button>
          </div>
          <Input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value) || 0)} placeholder="Միավորների տարբերություն" />
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Պատճառ (ոչ պարտադիր)" />
          <div className="flex justify-end">
            <Button onClick={() => openAdjust && adjustMut.mutate({ id: openAdjust.id, delta, reason: reason || undefined })} className="rounded-2xl">{adjustMut.isPending ? <Spinner size={16} /> : "Պահպանել"}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
