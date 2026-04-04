import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Gift, Plus, Search, BadgeCheck, Ban, Wallet } from "lucide-react";

import { page } from "../lib/motion";
import { cn } from "../lib/cn";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";

import {
  fetchGiftCards,
  createGiftCard,
  redeemGiftCard,
  type GiftCard,
} from "../lib/giftCardsApi";

function money(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("hy-AM").format(n) + " " + currency;
  } catch {
    return `${n} ${currency}`;
  }
}

function statusLabel(s: GiftCard["status"]) {
  switch (s) {
    case "active":
      return "Ակտիվ";
    case "redeemed":
      return "Սպառված";
    case "cancelled":
      return "Չեղարկված";
    default:
      return s;
  }
}

export function GiftCards() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openRedeem, setOpenRedeem] = useState<GiftCard | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["gift-cards", { q, status }],
    queryFn: () => fetchGiftCards({ q: q || undefined, status: status || undefined }),
  });

  const list = useMemo(() => data ?? [], [data]);

  const createMut = useMutation({
    mutationFn: createGiftCard,
    onSuccess: async () => {
      setOpenCreate(false);
      await qc.invalidateQueries({ queryKey: ["gift-cards"] });
    },
  });

  const redeemMut = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      redeemGiftCard(id, amount),
    onSuccess: async () => {
      setOpenRedeem(null);
      await qc.invalidateQueries({ queryKey: ["gift-cards"] });
    },
  });

  return (
    <motion.div {...page} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Նվերի վկայագրեր
          </div>
          <div className="text-sm text-muted-foreground">
            Ստեղծիր gift card-եր, տես մնացորդը, և նշիր մարում (redeem)։
          </div>
        </div>

        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="h-4 w-4" />
          Ստեղծել
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Փնտրել՝ կոդ / անուն / հեռախոս…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-lg border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Բոլորը</option>
            <option value="active">Ակտիվ</option>
            <option value="redeemed">Սպառված</option>
            <option value="cancelled">Չեղարկված</option>
          </select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Կոդ</th>
                <th className="p-3">Ստատուս</th>
                <th className="p-3">Մնացորդ</th>
                <th className="p-3">Սկզբնական</th>
                <th className="p-3">Ում համար</th>
                <th className="p-3">Վերջնաժամկետ</th>
                <th className="p-3 text-right">Գործողություն</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={7}>
                    Բեռնում է…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="p-4 text-red-600" colSpan={7}>
                    Չստացվեց բեռնել։
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={7}>
                    Դատարկ է։
                  </td>
                </tr>
              ) : (
                list.map((gc) => (
                  <tr key={gc.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{gc.code}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
                          gc.status === "active" && "bg-emerald-50 text-emerald-700",
                          gc.status === "redeemed" && "bg-slate-100 text-slate-700",
                          gc.status === "cancelled" && "bg-rose-50 text-rose-700"
                        )}
                      >
                        {gc.status === "active" ? (
                          <BadgeCheck className="h-3.5 w-3.5" />
                        ) : gc.status === "cancelled" ? (
                          <Ban className="h-3.5 w-3.5" />
                        ) : (
                          <Wallet className="h-3.5 w-3.5" />
                        )}
                        {statusLabel(gc.status)}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      {money(gc.balance, gc.currency)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {money(gc.initial_amount, gc.currency)}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{gc.issued_to_name ?? "—"}</div>
                      <div className="text-muted-foreground text-xs">{gc.issued_to_phone ?? ""}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {gc.expires_at ? gc.expires_at.slice(0, 10) : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="secondary"
                        disabled={gc.status !== "active" || gc.balance <= 0}
                        onClick={() => setOpenRedeem(gc)}
                      >
                        Մարել
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateGiftCardModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={(payload) => createMut.mutate(payload)}
        loading={createMut.isPending}
        errorMsg={(createMut.error as any)?.response?.data?.message}
      />

      <RedeemModal
        giftCard={openRedeem}
        onClose={() => setOpenRedeem(null)}
        onRedeem={(amount) =>
          openRedeem && redeemMut.mutate({ id: openRedeem.id, amount })
        }
        loading={redeemMut.isPending}
        errorMsg={(redeemMut.error as any)?.response?.data?.message}
      />
    </motion.div>
  );
}

function CreateGiftCardModal(props: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: any) => void;
  loading: boolean;
  errorMsg?: string;
}) {
  const [amount, setAmount] = useState("10000");
  const [code, setCode] = useState("");
  const [issuedToName, setIssuedToName] = useState("");
  const [issuedToPhone, setIssuedToPhone] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Նոր նվերի վկայագիր"
      description="Եթե կոդը դատարկ թողնես, կգեներացվի ավտոմատ։"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            Փակել
          </Button>
          <Button
            loading={props.loading}
            onClick={() =>
              props.onCreate({
                amount: Number(amount),
                code: code || null,
                issued_to_name: issuedToName || null,
                issued_to_phone: issuedToPhone || null,
                expires_at: expiresAt || null,
              })
            }
          >
            Ստեղծել
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {props.errorMsg ? (
          <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {props.errorMsg}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Գումար (AMD)</div>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Կոդ (ըստ ցանկության)</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Ում համար (անուն)</div>
            <Input value={issuedToName} onChange={(e) => setIssuedToName(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Ում համար (հեռախոս)</div>
            <Input value={issuedToPhone} onChange={(e) => setIssuedToPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Վերջնաժամկետ (YYYY-MM-DD)</div>
          <Input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} placeholder="2026-12-31" />
        </div>
      </div>
    </Modal>
  );
}

function RedeemModal(props: {
  giftCard: GiftCard | null;
  onClose: () => void;
  onRedeem: (amount: number) => void;
  loading: boolean;
  errorMsg?: string;
}) {
  const gc = props.giftCard;
  const [amount, setAmount] = useState("0");

  if (!gc) return null;

  return (
    <Modal
      open={!!gc}
      onClose={props.onClose}
      title="Մարում (redeem)"
      description={`Կոդ՝ ${gc.code} • Մնացորդ՝ ${money(gc.balance, gc.currency)}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            Փակել
          </Button>
          <Button
            loading={props.loading}
            onClick={() => props.onRedeem(Number(amount))}
          >
            Մարել
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {props.errorMsg ? (
          <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {props.errorMsg}
          </div>
        ) : null}

        <div>
          <div className="text-xs text-muted-foreground mb-1">Գումար</div>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
        </div>
      </div>
    </Modal>
  );
}
