import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, ChevronDown, Clock, Download, FileText, Search, User } from "lucide-react";
import { adminLogsApi } from "../services/adminLogsApi";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import type { AdminLog } from "../types/admin.types";

type PaginatedResponse = {
  current_page: number;
  data: AdminLog[];
  last_page: number;
  total: number;
};

type ApiResponse = {
  data: PaginatedResponse;
};

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "logs", search, page],
    queryFn: async () => {
      const res = await adminLogsApi.list({
        search: search || undefined,
        page,
        per_page: 50,
      });
      return res.data as unknown as ApiResponse;
    },
  });

  const pagination = data?.data;
  const logs = useMemo(() => pagination?.data ?? [], [pagination?.data]);

  const exportPayload = useMemo(
    () =>
      JSON.stringify(
        logs.map((log) => ({
          id: log.id,
          action: log.action,
          admin: log.admin?.name ?? null,
          model_type: log.model_type ?? null,
          model_id: log.model_id ?? null,
          created_at: log.created_at,
          ip_address: log.ip_address ?? null,
        })),
        null,
        2,
      ),
    [logs],
  );

  const handleExport = () => {
    const blob = new Blob([exportPayload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `admin-logs-page-${page}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "text-green-700 bg-green-50 border-green-200";
    if (action.includes("update")) return "text-blue-700 bg-blue-50 border-blue-200";
    if (action.includes("delete")) return "text-red-700 bg-red-50 border-red-200";
    if (action.includes("login")) return "text-purple-700 bg-purple-50 border-purple-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" /></div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <span>Չհաջողվեց բեռնել գործողությունների մատյանը</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<><FileText className="h-4 w-4" /> Admin activity</>}
        title="Գործողությունների մատյան"
        description="Ադմինների կատարած գործողությունները, փոփոխությունները և մուտքերի պատմությունը մեկ տեղում։"
        actions={
          <Button variant="secondary" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Ներբեռնել JSON
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Որոնել գործողություններ, ադմին կամ մոդել..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 pr-4"
            />
          </div>
          <div className="bb-stat-pill">Ընդամենը {pagination?.total ?? logs.length} գրառում</div>
        </div>
      </Card>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Գրառումներ չեն գտնվել"
            description={search ? "Փորձիր այլ բանալի բառ կամ բաց թող որոնումը։" : "Երբ ադմինները գործողություններ անեն, այստեղ կերևա պատմությունը։"}
          />
        ) : (
          logs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden p-0">
                <div
                  className="flex cursor-pointer items-start justify-between gap-4 p-4 transition hover:bg-slate-50/80"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getActionColor(log.action))}>
                        {log.action}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        {new Date(log.created_at).toLocaleString("hy-AM")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <User size={14} />
                        <span>{log.admin?.name || "Unknown"}</span>
                      </div>
                      {log.model_type ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <FileText size={14} />
                          <span>{log.model_type.split("\\").pop()}</span>
                          {log.model_id ? <span>#{log.model_id}</span> : null}
                        </div>
                      ) : null}
                      {log.ip_address ? <div className="text-xs text-slate-400">IP: {log.ip_address}</div> : null}
                    </div>
                  </div>

                  <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition-transform", expandedLog === log.id && "rotate-180")} />
                </div>

                {expandedLog === log.id ? (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-slate-100 bg-slate-50/70 p-4">
                    <div className="space-y-3">
                      {log.old_values && Object.keys(log.old_values).length > 0 ? (
                        <div>
                          <h4 className="mb-2 text-xs font-medium text-slate-500">Հին արժեքներ</h4>
                          <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs">{formatValue(log.old_values)}</pre>
                        </div>
                      ) : null}

                      {log.new_values && Object.keys(log.new_values).length > 0 ? (
                        <div>
                          <h4 className="mb-2 text-xs font-medium text-slate-500">Նոր արժեքներ</h4>
                          <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs">{formatValue(log.new_values)}</pre>
                        </div>
                      ) : null}

                      {log.user_agent ? (
                        <div className="text-xs text-slate-500"><span className="font-medium">User Agent:</span> {log.user_agent}</div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Էջ {pagination.current_page} / {pagination.last_page} · {pagination.total} գրառում</div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Նախորդ</Button>
            <Button variant="secondary" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((value) => value + 1)}>Հաջորդ</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
