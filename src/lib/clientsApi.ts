import { api } from "./api";
import type { Booking } from "./bookingsApi";

export type ClientRow = {
  id: number;
  business_id: number;
  client_account_id?: number | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  group_name?: string | null;
  is_vip?: boolean;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  status_segment?: string | null;
  birth_date?: string | null;
  blood_type?: string | null;
  medical_history?: string | null;
  allergies?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  loyalty_points_balance?: number;
  bookings_count?: number;
  total_spent?: number;
  last_booking_at?: string | null;
  next_booking_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};


export type ClientNote = {
  id: number;
  body: string;
  note_type?: string | null;
  is_pinned?: boolean;
  author_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientReminderDelivery = {
  id: number;
  channel: string;
  status: string;
  recipient?: string | null;
  provider?: string | null;
  scheduled_for?: string | null;
  sent_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
};

export type ClientReminder = {
  id: number;
  title: string;
  note?: string | null;
  remind_at?: string | null;
  channel?: string | null;
  status?: string | null;
  is_enabled?: boolean;
  lead_minutes?: number;
  notify_via?: string[];
  author_name?: string | null;
  completed_at?: string | null;
  deliveries?: ClientReminderDelivery[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type ClientTimelineItem = {
  id: string;
  type: "booking" | "note" | "reminder";
  title: string;
  subtitle?: string | null;
  status?: string | null;
  body?: string | null;
  occurred_at?: string | null;
};

export type ClientListResponse = {
  data: ClientRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  meta?: {
    group_counts?: Array<{ group_name: string; total: number }>;
    vip_count?: number;
    blacklisted_count?: number;
  };
};

export type ClientDetails = ClientRow & {
  recent_bookings?: Booking[];
  recent_notes?: ClientNote[];
  reminders?: ClientReminder[];
  timeline?: ClientTimelineItem[];
  crm?: {
    completed_count: number;
    cancelled_count: number;
    no_show_count: number;
    avg_ticket: number;
    favorite_service_name?: string | null;
    favorite_staff_name?: string | null;
    favorite_source?: string | null;
    last_source?: string | null;
    linked_account?: boolean;
  };
};

export type ClientFormPayload = {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  birth_date?: string | null;
  group_name?: string | null;
  is_vip?: boolean;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  medical_history?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
};

export async function fetchClients(params?: {
  search?: string;
  page?: number;
  per_page?: number;
  segment?: string;
  group?: string;
  status?: string;
}): Promise<ClientListResponse> {
  const r = await api.get("/clients", { params });
  return r.data as ClientListResponse;
}

export async function fetchClient(id: number): Promise<ClientDetails> {
  const r = await api.get(`/clients/${id}`);
  return r.data.data as ClientDetails;
}

export async function fetchClientBookings(id: number, params?: { page?: number; per_page?: number }) {
  const r = await api.get(`/clients/${id}/bookings`, { params });
  return r.data as { data: Booking[]; current_page: number; last_page: number; total: number };
}

export async function createClient(payload: ClientFormPayload): Promise<ClientRow> {
  const r = await api.post("/clients", payload);
  return r.data.data as ClientRow;
}

export async function updateClient(id: number, payload: Partial<ClientFormPayload>): Promise<ClientRow> {
  const r = await api.put(`/clients/${id}`, payload);
  return r.data.data as ClientRow;
}


export async function createClientNote(clientId: number, payload: { body: string; note_type?: string | null; is_pinned?: boolean }) {
  const r = await api.post(`/clients/${clientId}/notes`, payload);
  return r.data.data as ClientNote;
}

export async function updateClientNote(clientId: number, noteId: number, payload: Partial<{ body: string; note_type: string | null; is_pinned: boolean }>) {
  const r = await api.put(`/clients/${clientId}/notes/${noteId}`, payload);
  return r.data.data as ClientNote;
}

export async function deleteClientNote(clientId: number, noteId: number) {
  await api.delete(`/clients/${clientId}/notes/${noteId}`);
}

export async function createClientReminder(clientId: number, payload: { title: string; note?: string | null; remind_at: string; channel?: string | null; status?: string; is_enabled?: boolean; lead_minutes?: number; notify_via?: string[] }) {
  const r = await api.post(`/clients/${clientId}/reminders`, payload);
  return r.data.data as ClientReminder;
}

export async function updateClientReminder(clientId: number, reminderId: number, payload: Partial<{ title: string; note: string | null; remind_at: string; channel: string | null; status: string; is_enabled: boolean; lead_minutes: number; notify_via: string[] }>) {
  const r = await api.put(`/clients/${clientId}/reminders/${reminderId}`, payload);
  return r.data.data as ClientReminder;
}

export async function deleteClientReminder(clientId: number, reminderId: number) {
  await api.delete(`/clients/${clientId}/reminders/${reminderId}`);
}

export async function dispatchClientReminder(clientId: number, reminderId: number) {
  const r = await api.post(`/clients/${clientId}/reminders/${reminderId}/dispatch`);
  return r.data.data as ClientReminder;
}
