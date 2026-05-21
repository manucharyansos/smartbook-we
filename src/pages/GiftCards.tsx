import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Gift, History, Plus, Search, Wallet } from 'lucide-react';

import { page } from '../lib/motion';
import { cn } from '../lib/cn';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  adjustGiftCard,
  createGiftCard,
  fetchGiftCardLedger,
  fetchGiftCards,
  lookupGiftCard,
  redeemGiftCard,
  type GiftCard,
} from '../lib/giftCardsApi';

function money(n: number, currency: string) {
  try {
    return `${new Intl.NumberFormat('hy-AM').format(n)} ${currency}`;
  } catch {
    return `${n} ${currency}`;
  }
}

function statusLabel(s: GiftCard['status']) {
  switch (s) {
    case 'active': return 'Ակտիվ';
    case 'redeemed': return 'Սպառված';
    case 'cancelled': return 'Չեղարկված';
    default: return s;
  }
}

function statusTone(s: GiftCard['status']) {
  switch (s) {
    case 'active': return 'bg-emerald-50 text-emerald-700';
    case 'redeemed': return 'bg-slate-100 text-slate-700';
    case 'cancelled': return 'bg-rose-50 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export function GiftCards() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openRedeem, setOpenRedeem] = useState<GiftCard | null>(null);
  const [openAdjust, setOpenAdjust] = useState<GiftCard | null>(null);
  const [ledgerCard, setLedgerCard] = useState<GiftCard | null>(null);
  const [lookupCode, setLookupCode] = useState('');

  const listQ = useQuery({
    queryKey: ['gift-cards', { q, status }],
    queryFn: () => fetchGiftCards({ q: q || undefined, status: status || undefined }),
  });
  const ledgerQ = useQuery({
    queryKey: ['gift-card-ledger', ledgerCard?.id ?? 0],
    queryFn: () => fetchGiftCardLedger(ledgerCard!.id),
    enabled: !!ledgerCard,
  });
  const lookupQ = useMutation({ mutationFn: lookupGiftCard });

  const createMut = useMutation({
    mutationFn: createGiftCard,
    onSuccess: async () => {
      setOpenCreate(false);
      await qc.invalidateQueries({ queryKey: ['gift-cards'] });
    },
  });
  const redeemMut = useMutation({
    mutationFn: ({ id, amount, reason }: { id: number; amount: number; reason?: string }) => redeemGiftCard(id, amount, reason),
    onSuccess: async () => {
      setOpenRedeem(null);
      await qc.invalidateQueries({ queryKey: ['gift-cards'] });
    },
  });
  const adjustMut = useMutation({
    mutationFn: ({ id, delta, reason }: { id: number; delta: number; reason?: string }) => adjustGiftCard(id, delta, reason),
    onSuccess: async () => {
      setOpenAdjust(null);
      await qc.invalidateQueries({ queryKey: ['gift-cards'] });
    },
  });

  const list = listQ.data ?? [];
  const totalBalance = useMemo(() => list.reduce((sum, item) => sum + item.balance, 0), [list]);

  return (
    <motion.div {...page} className="space-y-6">
      <div className="rounded-[32px] border border-white/70 bg-white/88 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Gift className="h-4 w-4" /> Նվերի քարտեր
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Վաճառք, մնացորդ և պատմություն</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">Թողարկիր նվերի քարտեր, ստուգիր կոդը, նշիր մարում և պահիր ամբողջ շարժի պատմությունը։</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">Ընդհանուր մնացորդ՝ {money(totalBalance, 'AMD')}</div>
            <Button onClick={() => setOpenCreate(true)} className="rounded-2xl"><Plus className="h-4 w-4" /> Ստեղծել քարտ</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="rounded-[28px] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Փնտրել՝ կոդ / անուն / հեռախոս" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Բոլորը</option>
              <option value="active">Ակտիվ</option>
              <option value="redeemed">Սպառված</option>
              <option value="cancelled">Չեղարկված</option>
            </select>
          </div>

          <div className="mt-6 space-y-3">
            {listQ.isLoading ? <div className="text-sm text-slate-500">Բեռնում է…</div> : list.map((gc) => (
              <div key={gc.id} className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-sm font-semibold text-slate-900">{gc.code}</div>
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', statusTone(gc.status))}>{statusLabel(gc.status)}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{gc.issued_to_name || 'Անուն նշված չէ'} {gc.issued_to_phone ? `· ${gc.issued_to_phone}` : ''}</div>
                    <div className="mt-1 text-xs text-slate-500">Սկզբնական՝ {money(gc.initial_amount, gc.currency)} · Մնացորդ՝ {money(gc.balance, gc.currency)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setLedgerCard(gc)} className="rounded-2xl"><History className="h-4 w-4" /> Պատմություն</Button>
                    <Button variant="secondary" disabled={gc.status !== 'active' || gc.balance <= 0} onClick={() => setOpenRedeem(gc)} className="rounded-2xl"><Wallet className="h-4 w-4" /> Մարել</Button>
                    <Button variant="secondary" onClick={() => setOpenAdjust(gc)} className="rounded-2xl">Կարգավորել</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] p-6">
          <div className="text-lg font-semibold text-slate-900">Կոդի արագ ստուգում</div>
          <div className="mt-4 space-y-3">
            <Input value={lookupCode} onChange={(e) => setLookupCode(e.target.value.toUpperCase())} placeholder="Օր. GC-AB12CD34" />
            <Button onClick={() => lookupQ.mutate(lookupCode)} className="w-full rounded-2xl">Ստուգել քարտը</Button>
            {lookupQ.isPending ? <div className="text-sm text-slate-500">Ստուգում է…</div> : null}
            {lookupQ.isError ? <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">Քարտը չի գտնվել կամ ակտիվ չէ</div> : null}
            {lookupQ.data ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{lookupQ.data.code}</div>
                <div className="mt-1">Մնացորդ՝ {money(lookupQ.data.balance, lookupQ.data.currency)}</div>
                <div className="mt-1">Ստատուս՝ {statusLabel(lookupQ.data.status)}</div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <CreateGiftCardModal open={openCreate} onClose={() => setOpenCreate(false)} onCreate={(payload) => createMut.mutate(payload)} loading={createMut.isPending} />
      <RedeemGiftCardModal giftCard={openRedeem} onClose={() => setOpenRedeem(null)} onRedeem={(amount, reason) => openRedeem && redeemMut.mutate({ id: openRedeem.id, amount, reason })} loading={redeemMut.isPending} />
      <AdjustGiftCardModal giftCard={openAdjust} onClose={() => setOpenAdjust(null)} onAdjust={(delta, reason) => openAdjust && adjustMut.mutate({ id: openAdjust.id, delta, reason })} loading={adjustMut.isPending} />
      <LedgerModal card={ledgerCard} entries={ledgerQ.data ?? []} loading={ledgerQ.isLoading} onClose={() => setLedgerCard(null)} />
    </motion.div>
  );
}

function CreateGiftCardModal({ open, onClose, onCreate, loading }: { open: boolean; onClose: () => void; onCreate: (payload: any) => void; loading: boolean }) {
  const [amount, setAmount] = useState('10000');
  const [code, setCode] = useState('');
  const [issuedToName, setIssuedToName] = useState('');
  const [issuedToPhone, setIssuedToPhone] = useState('');
  const [purchasedByName, setPurchasedByName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Նոր նվերի քարտ">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Գումար (AMD)" />
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Կոդ (ոչ պարտադիր)" />
          <Input value={issuedToName} onChange={(e) => setIssuedToName(e.target.value)} placeholder="Ում համար է" />
          <Input value={issuedToPhone} onChange={(e) => setIssuedToPhone(e.target.value)} placeholder="Ում համարի հեռախոս" />
          <Input value={purchasedByName} onChange={(e) => setPurchasedByName(e.target.value)} placeholder="Ով է գնել" />
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Վերջնաժամկետ</div>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Նշումներ" />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Փակել</Button>
          <Button loading={loading} onClick={() => onCreate({ amount: Number(amount), code: code || null, issued_to_name: issuedToName || null, issued_to_phone: issuedToPhone || null, purchased_by_name: purchasedByName || null, expires_at: expiresAt || null, notes: notes || null })}>Ստեղծել</Button>
        </div>
      </div>
    </Modal>
  );
}

function RedeemGiftCardModal({ giftCard, onClose, onRedeem, loading }: { giftCard: GiftCard | null; onClose: () => void; onRedeem: (amount: number, reason?: string) => void; loading: boolean }) {
  const [amount, setAmount] = useState('0');
  const [reason, setReason] = useState('');
  if (!giftCard) return null;
  return (
    <Modal open={!!giftCard} onClose={onClose} title="Մարել նվերի քարտը">
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{giftCard.code} · Մնացորդ՝ {money(giftCard.balance, giftCard.currency)}</div>
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Գումար" />
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Պատճառ" />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Փակել</Button>
          <Button loading={loading} onClick={() => onRedeem(Number(amount), reason || undefined)}>Մարել</Button>
        </div>
      </div>
    </Modal>
  );
}

function AdjustGiftCardModal({ giftCard, onClose, onAdjust, loading }: { giftCard: GiftCard | null; onClose: () => void; onAdjust: (delta: number, reason?: string) => void; loading: boolean }) {
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('');
  if (!giftCard) return null;
  return (
    <Modal open={!!giftCard} onClose={onClose} title="Կարգավորել մնացորդը">
      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{giftCard.code} · Ներկա մնացորդ՝ {money(giftCard.balance, giftCard.currency)}</div>
        <Input value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="Օր. +1000 կամ -1000" />
        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Պատճառ" />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Փակել</Button>
          <Button loading={loading} onClick={() => onAdjust(Number(delta), reason || undefined)}>Պահպանել</Button>
        </div>
      </div>
    </Modal>
  );
}

function LedgerModal({ card, entries, loading, onClose }: { card: GiftCard | null; entries: Array<{ id: number; entry_type: string; delta_amount: number; reason: string | null; created_at: string }>; loading: boolean; onClose: () => void }) {
  return (
    <Modal open={!!card} onClose={onClose} title={card ? `${card.code} — պատմություն` : 'Պատմություն'}>
      <div className="space-y-3">
        {loading ? <div className="text-sm text-slate-500">Բեռնում է…</div> : entries.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-slate-900">{entry.entry_type}</div>
              <div className={entry.delta_amount >= 0 ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{entry.delta_amount >= 0 ? `+${entry.delta_amount}` : entry.delta_amount}</div>
            </div>
            <div className="mt-1 text-slate-500">{entry.reason || '—'}</div>
            <div className="mt-1 text-xs text-slate-400">{new Date(entry.created_at).toLocaleString('hy-AM')}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
