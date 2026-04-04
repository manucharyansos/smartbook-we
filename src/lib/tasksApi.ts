import { api } from "./api";
import { resolveMediaUrl } from "./mediaUrl";

export type TaskStatus = "open" | "in_progress" | "completed" | "canceled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskRow = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  completed_at: string | null;
  is_overdue: boolean;
  assignee: null | {
    id: number;
    name: string;
    email: string | null;
    avatar_url: string | null;
  };
  creator: null | {
    id: number;
    name: string;
  };
  client: null | {
    id: number;
    name: string;
    phone: string | null;
  };
  booking: null | {
    id: number;
    starts_at: string | null;
    status: string;
  };
  created_at: string | null;
  updated_at: string | null;
};

export type TaskSummary = {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  overdue: number;
  due_today: number;
};

export async function fetchTasks(params?: {
  search?: string;
  status?: string;
  priority?: string;
  assignee_id?: number | null;
  overdue?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.search?.trim()) qs.set("search", params.search.trim());
  if (params?.status) qs.set("status", params.status);
  if (params?.priority) qs.set("priority", params.priority);
  if (params?.assignee_id) qs.set("assignee_id", String(params.assignee_id));
  if (params?.overdue) qs.set("overdue", "1");

  const res = await api.get(`/tasks${qs.toString() ? `?${qs.toString()}` : ""}`);
  const items = (res.data.data as TaskRow[]).map((item) => ({
    ...item,
    assignee: item.assignee
      ? { ...item.assignee, avatar_url: resolveMediaUrl(item.assignee.avatar_url) }
      : null,
  }));

  return {
    data: items,
    summary: (res.data.meta?.summary ?? {
      total: 0,
      open: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      due_today: 0,
    }) as TaskSummary,
  };
}

export async function createTask(payload: {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: number | null;
  due_at?: string | null;
}) {
  const res = await api.post("/tasks", payload);
  return res.data.data as TaskRow;
}

export async function updateTask(
  id: number,
  payload: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: number | null;
    due_at: string | null;
  }>,
) {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data.data as TaskRow;
}

export async function patchTaskStatus(id: number, status: TaskStatus) {
  const res = await api.patch(`/tasks/${id}`, { status });
  return res.data.data as TaskRow;
}

export async function deleteTask(id: number) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data as { ok: boolean };
}
