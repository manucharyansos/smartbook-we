import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { History, Minus, Plus, Search, Sparkles, Star, Wallet } from 'lucide-react';

import { page } from '../lib/motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import {
  adjustLoyaltyClient,
  fetchLoyaltyClientLedger,
  fetchLoyaltyClients,
  fetchLoyaltyProgram,
  previewLoyalty,
  updateLoyaltyProgram,
  type LoyaltyClient,
  type LoyaltyLedgerEntry,
} from '../lib/loyaltyApi';

type AdjustState = { client: LoyaltyClient; delta: number; reason: string } | null;

function entryLabel(entry: LoyaltyLedgerEntry) {
  switch (entry.entry_type) {
    case 'earned': return 'Վաստակած';
    case 'redeemed': return 'Օգտագործված';
    case 'restored': return 'Վերադարձված';
    case 'adjustment': return 'Ձեռքով փոփոխված';
    default: return entry.entry_type;
  }
}

export default function Loyalty() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [adjustState, setAdjustState] = useState<AdjustState>(null);
  const [ledgerClient, setLedgerClient] = useState<LoyaltyClient | null>(null);
  const [previewClientId, setPreviewClientId] = useState<number | ''>('');
  const [previewAmount, setPreviewAmount] = useState<number>(10000);
  const [previewPoints, setPreviewPoints] = useState<number>(100);

  const programQ = useQuery({ queryKey: ['loyalty', 'program'], queryFn: fetchLoyaltyProgram });
  const clientsQ = useQuery({ queryKey: ['loyalty', 'clients', q], queryFn: () => fetchLoyaltyClients(q) });
  const ledgerQ = useQuery({
    queryKey: ['loyalty', 'ledger', ledgerClient?.id ?? 0],
    queryFn: () => fetchLoyaltyClientLedger(ledgerClient!.id),
    enabled: !!ledgerClient,
  });
  const previewQ = useQuery({
    queryKey: ['loyalty', 'preview', previewClientId, previewAmount, previewPoints],
    queryFn: () => previewLoyalty(Number(previewClientId), previewAmount, previewPoints),
    enabled: !!previewClientId && previewAmount > 0 && previewPoints >= 0,
  });

  const saveProgram = useMutation({
    mutationFn: updateLoyaltyProgram,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });
  const adjustMut = useMutation({
    mutationFn: (p: { id: number; delta: number; reason?: string }) => adjustLoyaltyClient(p.id, p.delta, p.reason),
    onSuccess: async () => {
      setAdjustState(null);
      await qc.invalidateQueries({ queryKey: ['loyalty'] });
    },
  });

  const program = programQ.data;
  const clients = useMemo(() => clientsQ.data ?? [], [clientsQ.data]);
  const totalBalance = useMemo(() => clients.reduce((sum, client) => sum + client.points, 0), [clients]);

  return (
    <motion.div {...page} className="admin-page space-y-4">
      <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" /> Լոյալության համակարգ
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Միավորներ և օգտագործման կանոններ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Կարգավորիր ինչպես են միավորները կուտակվում, ինչպես են փոխարկվում զեղչի և վերահսկիր հաճախորդների ամբողջ պատմությունը։
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
              Ընդհանուր մնացորդ՝ {totalBalance} միավոր
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700">
              {program ? `${program.points_per_currency_unit} միավոր / ${program.currency_unit} դրամ` : 'Բեռնում է…'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[28px] p-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Star className="h-5 w-5" /> Ծրագրի կարգավորումներ</div>
          {programQ.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Բեռնում է...</div> : program ? (
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-600">Միացված է
                <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={program.is_enabled ? '1' : '0'} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, is_enabled: e.target.value === '1' })}>
                  <option value="1">Այո</option>
                  <option value="0">Ոչ</option>
                </select>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-600">Քանի դրամի համար
                  <Input type="number" className="mt-2" value={program.currency_unit} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, currency_unit: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Քանի միավոր տրվի
                  <Input type="number" className="mt-2" value={program.points_per_currency_unit} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, points_per_currency_unit: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Օգտագործման քայլ (միավոր)
                  <Input type="number" className="mt-2" value={program.redeem_points_step} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, redeem_points_step: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Յուրաքանչյուր քայլի զեղչ (AMD)
                  <Input type="number" className="mt-2" value={program.redeem_currency_amount} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, redeem_currency_amount: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Առավելագույն զեղչ (%)
                  <Input type="number" className="mt-2" value={program.max_redeem_percent} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, max_redeem_percent: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Միավորների ժամկետ (օր)
                  <Input type="number" className="mt-2" value={program.points_expire_after_days} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, points_expire_after_days: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Նվազագույն ամրագրման գումար
                  <Input type="number" className="mt-2" value={program.min_booking_amount} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, min_booking_amount: Number(e.target.value) || 0 })} />
                </label>
                <label className="block text-sm text-slate-600">Թույլատրել միաժամանակ նվերի քարտ + միավոր
                  <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={program.allow_gift_card_with_points ? '1' : '0'} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, allow_gift_card_with_points: e.target.value === '1' })}>
                    <option value="1">Այո</option>
                    <option value="0">Ոչ</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm text-slate-600">Նշումներ
                <Input className="mt-2" value={program.notes ?? ''} onChange={(e) => qc.setQueryData(['loyalty', 'program'], { ...program, notes: e.target.value })} />
              </label>
              <div className="flex items-center justify-end">
                <Button onClick={() => saveProgram.mutate(program)} className="rounded-2xl">{saveProgram.isPending ? <Spinner size={16} /> : 'Պահպանել'}</Button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="rounded-[28px] p-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Wallet className="h-5 w-5" /> Օգտագործման նախադիտում</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-600">Հաճախորդ
              <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={previewClientId} onChange={(e) => setPreviewClientId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Ընտրիր...</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.points} միավոր</option>)}
              </select>
            </label>
            <label className="block text-sm text-slate-600">Ամրագրման գումար
              <Input type="number" className="mt-2" value={previewAmount} onChange={(e) => setPreviewAmount(Number(e.target.value) || 0)} />
            </label>
            <label className="block text-sm text-slate-600 md:col-span-2">Օգտագործվող միավորներ
              <Input type="number" className="mt-2" value={previewPoints} onChange={(e) => setPreviewPoints(Number(e.target.value) || 0)} />
            </label>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {previewQ.isLoading ? 'Հաշվում է…' : previewQ.data ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <div>Մնացորդ՝ <b>{previewQ.data.balance}</b></div>
                <div>Կկիրառվի՝ <b>{previewQ.data.applied_points}</b></div>
                <div>Զեղչ՝ <b>{previewQ.data.discount_amount} AMD</b></div>
              </div>
            ) : 'Ընտրիր հաճախորդ և գումար։'}
          </div>
        </Card>
      </div>

      <Card className="rounded-[28px] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><History className="h-5 w-5" /> Հաճախորդների միավորներ</div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Փնտրել հաճախորդ" className="pl-9" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {clientsQ.isLoading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Բեռնում է...</div> : clients.map((client) => (
            <div key={client.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium text-slate-900">{client.name}</div>
                <div className="text-sm text-slate-500">{client.phone || 'Հեռախոս չկա'} · Ընդհանուր վաստակած՝ {client.lifetime_earned}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">{client.points} միավոր</div>
                <Button variant="secondary" className="rounded-2xl" onClick={() => setLedgerClient(client)}>Պատմություն</Button>
                <Button variant="secondary" className="rounded-2xl" onClick={() => setAdjustState({ client, delta: 0, reason: '' })}>Կարգավորել</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={!!adjustState} onClose={() => setAdjustState(null)} title="Կարգավորել միավորները">
        {adjustState ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="rounded-2xl gap-2" onClick={() => setAdjustState({ ...adjustState, delta: adjustState.delta + 1 })}><Plus className="h-4 w-4" /> Ավելացնել</Button>
              <Button variant="secondary" className="rounded-2xl gap-2" onClick={() => setAdjustState({ ...adjustState, delta: adjustState.delta - 1 })}><Minus className="h-4 w-4" /> Պակասեցնել</Button>
            </div>
            <Input type="number" value={adjustState.delta} onChange={(e) => setAdjustState({ ...adjustState, delta: Number(e.target.value) || 0 })} placeholder="Միավորների փոփոխություն" />
            <Input value={adjustState.reason} onChange={(e) => setAdjustState({ ...adjustState, reason: e.target.value })} placeholder="Պատճառ" />
            <div className="flex justify-end">
              <Button onClick={() => adjustMut.mutate({ id: adjustState.client.id, delta: adjustState.delta, reason: adjustState.reason || undefined })} className="rounded-2xl">{adjustMut.isPending ? <Spinner size={16} /> : 'Պահպանել'}</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!ledgerClient} onClose={() => setLedgerClient(null)} title={ledgerClient ? `${ledgerClient.name} — միավորների պատմություն` : 'Միավորների պատմություն'}>
        <div className="space-y-3">
          {ledgerQ.isLoading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Բեռնում է...</div> : (ledgerQ.data ?? []).map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-slate-900">{entryLabel(entry)}</div>
                <div className={entry.delta_points >= 0 ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{entry.delta_points >= 0 ? `+${entry.delta_points}` : entry.delta_points}</div>
              </div>
              <div className="mt-1 text-slate-500">{entry.reason || '—'}</div>
              <div className="mt-1 text-xs text-slate-400">{new Date(entry.created_at).toLocaleString('hy-AM')}</div>
            </div>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
}
