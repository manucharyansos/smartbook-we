import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlarmClock, CheckCircle2, CircleSlash2, ListFilter, Plus, Search, Trash2, UserRound } from "lucide-react";

import { page } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../store/auth";
import { fetchStaff } from "../lib/staffApi";
import {
  createTask,
  deleteTask,
  fetchTasks,
  patchTaskStatus,
  updateTask,
  type TaskPriority,
  type TaskRow,
  type TaskStatus,
} from "../lib/tasksApi";
import { cn } from "../lib/cn";

type Column = {
  key: TaskStatus;
  title: string;
  tone: string;
};

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string;
  due_at: string;
};

const columns: Column[] = [
  { key: "open", title: "Պլանավորված", tone: "from-slate-500/10 to-slate-100/60" },
  { key: "in_progress", title: "Ընթացքում", tone: "from-amber-500/10 to-orange-100/60" },
  { key: "completed", title: "Ավարտված", tone: "from-emerald-500/10 to-emerald-100/60" },
  { key: "canceled", title: "Չեղարկված", tone: "from-rose-500/10 to-rose-100/60" },
];

const emptyForm: FormState = {
  title: "",
  description: "",
  priority: "medium",
  status: "open",
  assignee_id: "",
  due_at: "",
};

function priorityLabel(priority: TaskPriority) {
  return (
    {
      low: "Ցածր",
      medium: "Միջին",
      high: "Բարձր",
      urgent: "Շտապ",
    } as const
  )[priority];
}

function priorityUi(priority: TaskPriority) {
  return (
    {
      low: "border-slate-200 bg-white text-slate-600",
      medium: "border-violet-200 bg-violet-50 text-violet-700",
      high: "border-orange-200 bg-orange-50 text-orange-700",
      urgent: "border-rose-200 bg-rose-50 text-rose-700",
    } as const
  )[priority];
}

function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function formatDue(value: string | null) {
  if (!value) return "Առանց վերջնաժամկետի";
  try {
    return new Date(value).toLocaleString("hy-AM", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
    </Card>
  );
}

function TaskCard({
  task,
  canManage,
  onEdit,
  onDelete,
  onMove,
}: {
  task: TaskRow;
  canManage: boolean;
  onEdit: (task: TaskRow) => void;
  onDelete: (task: TaskRow) => void;
  onMove: (task: TaskRow, status: TaskStatus) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-950">{task.title}</div>
          {task.description ? <div className="mt-2 text-sm leading-6 text-slate-600">{task.description}</div> : null}
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", priorityUi(task.priority))}>
          {priorityLabel(task.priority)}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5" /> {task.assignee?.name ?? "Առանց աշխատակցի"}</div>
        <div className="flex items-center gap-2"><AlarmClock className="h-3.5 w-3.5" /> {formatDue(task.due_at)}</div>
        {task.client ? <div>Հաճախորդ՝ {task.client.name}</div> : null}
        {task.booking ? <div>Ամրագրում #{task.booking.id}</div> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {columns
          .filter((col) => col.key !== task.status)
          .slice(0, 2)
          .map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => onMove(task, col.key)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Տանել՝ {col.title}
            </button>
          ))}
      </div>

      {canManage ? (
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => onEdit(task)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
            Խմբագրել
          </button>
          <button type="button" onClick={() => onDelete(task)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100">
            <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Ջնջել
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Tasks() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isStaff = user?.role === "staff";
  const canManage = !isStaff;

  const [filters, setFilters] = useState({ search: "", priority: "", assignee_id: "", overdue: false });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const tasksQ = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () =>
      fetchTasks({
        search: filters.search || undefined,
        priority: filters.priority || undefined,
        assignee_id: filters.assignee_id ? Number(filters.assignee_id) : null,
        overdue: filters.overdue,
      }),
  });

  const staffQ = useQuery({ queryKey: ["staff", "tasks-board"], queryFn: fetchStaff, enabled: canManage });

  const createMut = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      closeModal();
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateTask>[1] }) => updateTask(id, payload),
    onSuccess: async () => {
      closeModal();
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) => patchTaskStatus(id, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const tasks = tasksQ.data?.data ?? [];
  const summary = tasksQ.data?.summary ?? { total: 0, open: 0, in_progress: 0, completed: 0, overdue: 0, due_today: 0 };
  const staff = staffQ.data ?? [];

  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, TaskRow[]> = { open: [], in_progress: [], completed: [], canceled: [] };
    for (const task of tasks) groups[task.status].push(task);
    return groups;
  }, [tasks]);

  function closeModal() {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(task: TaskRow) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      assignee_id: task.assignee?.id ? String(task.assignee.id) : "",
      due_at: toLocalInputValue(task.due_at),
    });
    setOpen(true);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      due_at: form.due_at ? form.due_at.replace("T", " ") : null,
    };
    if (!payload.title) return;
    if (editing) updateMut.mutate({ id: editing.id, payload });
    else createMut.mutate(payload);
  }

  return (
    <motion.div {...page} className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_35%),white] p-8 shadow-[0_18px_60px_rgba(124,58,237,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              <ListFilter className="h-4 w-4" /> Kanban tasks
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Թասքեր</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">Task board՝ պլանավորված, ընթացիկ, ավարտված և չեղարկված սյունակներով։ Owner/manager-ը կառավարում է ամբողջ թիմը, staff-ը՝ միայն իրենը։</p>
          </div>
          {canManage ? (
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Նոր task</Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Summary label="Ընդամենը" value={summary.total} />
        <Summary label="Բաց" value={summary.open} />
        <Summary label="Ընթացքում" value={summary.in_progress} />
        <Summary label="Ուշացած" value={summary.overdue} />
      </div>

      <Card className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 2xl:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Փնտրել task" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm" />
          </label>
          <select value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <option value="">Բոլոր priority-ները</option>
            <option value="low">Ցածր</option>
            <option value="medium">Միջին</option>
            <option value="high">Բարձր</option>
            <option value="urgent">Շտապ</option>
          </select>
          <select value={filters.assignee_id} onChange={(e) => setFilters((p) => ({ ...p, assignee_id: e.target.value }))} disabled={!canManage} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:bg-slate-50">
            <option value="">Բոլոր աշխատակիցները</option>
            {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={filters.overdue} onChange={(e) => setFilters((p) => ({ ...p, overdue: e.target.checked }))} />
            Միայն ուշացած
          </label>
        </div>
      </Card>

      {tasksQ.isLoading ? (
        <div className="flex min-h-[260px] items-center justify-center"><Spinner size={28} /></div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={Plus} title="Task-եր դեռ չկան" description="Ստեղծիր առաջին task-ը և սկսիր աշխատանքը board view-ով։" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {columns.map((col) => (
            <div key={col.key} className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className={cn("rounded-[24px] bg-gradient-to-br p-4", col.tone)}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-950">{col.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{grouped[col.key].length} քարտ</div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/70 bg-white/80 text-slate-700 shadow-sm">
                    {col.key === "completed" ? <CheckCircle2 className="h-5 w-5" /> : col.key === "canceled" ? <CircleSlash2 className="h-5 w-5" /> : <AlarmClock className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {grouped[col.key].length ? grouped[col.key].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canManage={canManage}
                    onEdit={openEdit}
                    onDelete={(row) => deleteMut.mutate(row.id)}
                    onMove={(row, status) => statusMut.mutate({ id: row.id, status })}
                  />
                )) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">Դատարկ սյունակ</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={closeModal} title={editing ? "Խմբագրել task" : "Նոր task"}>
        <form onSubmit={submitForm} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Վերնագիր</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Նկարագրություն</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="low">Ցածր</option>
                <option value="medium">Միջին</option>
                <option value="high">Բարձր</option>
                <option value="urgent">Շտապ</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Ստատուս</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                {columns.map((col) => <option key={col.key} value={col.key}>{col.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Աշխատակից</label>
              <select value={canManage ? form.assignee_id : String(user?.id ?? "")} disabled={!canManage} onChange={(e) => setForm((p) => ({ ...p, assignee_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm disabled:bg-slate-50">
                <option value="">Ընտրել</option>
                {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Վերջնաժամկետ</label>
              <input type="datetime-local" value={form.due_at} onChange={(e) => setForm((p) => ({ ...p, due_at: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Չեղարկել</Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>{editing ? "Պահպանել" : "Ստեղծել"}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
