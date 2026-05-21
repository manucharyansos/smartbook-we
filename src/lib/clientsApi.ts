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



export type DentalProfile = {
  id: number;
  chief_complaint?: string | null;
  dental_history?: string | null;
  current_medications?: string | null;
  treatment_alerts?: string | null;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  preferred_doctor?: string | null;
  pain_level?: number | null;
  oral_hygiene_status?: "good" | "fair" | "poor" | null;
  periodontal_risk?: "low" | "medium" | "high" | null;
  last_xray_at?: string | null;
  next_follow_up_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DentalProfilePayload = {
  chief_complaint?: string | null;
  dental_history?: string | null;
  current_medications?: string | null;
  treatment_alerts?: string | null;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  preferred_doctor?: string | null;
  pain_level?: number | null;
  oral_hygiene_status?: "good" | "fair" | "poor" | null;
  periodontal_risk?: "low" | "medium" | "high" | null;
  last_xray_at?: string | null;
  next_follow_up_at?: string | null;
};

export type DentalTreatmentRecord = {
  id: number;
  booking_id?: number | null;
  performed_by_user_id?: number | null;
  visit_date?: string | null;
  procedure_name?: string | null;
  procedure_code?: string | null;
  diagnosis?: string | null;
  treated_teeth?: string[];
  surfaces?: string[];
  notes?: string | null;
  recommendation?: string | null;
  treatment_status?: "planned" | "in_progress" | "completed" | "cancelled" | null;
  priority?: "routine" | "urgent" | "emergency" | null;
  cost?: number | null;
  follow_up_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DentalTreatmentPayload = {
  booking_id?: number | null;
  performed_by_user_id?: number | null;
  visit_date?: string | null;
  procedure_name: string;
  procedure_code?: string | null;
  diagnosis?: string | null;
  treated_teeth?: string[];
  surfaces?: string[];
  notes?: string | null;
  recommendation?: string | null;
  treatment_status?: "planned" | "in_progress" | "completed" | "cancelled" | null;
  priority?: "routine" | "urgent" | "emergency" | null;
  cost?: number | null;
  follow_up_at?: string | null;
};

export type DentalToothRecord = {
  id: number;
  tooth_number: string;
  status?: "healthy" | "attention" | "planned" | "treated" | "monitoring" | "missing" | null;
  condition_label?: string | null;
  surface_summary?: string[];
  notes?: string | null;
  recommendation?: string | null;
  priority?: "routine" | "urgent" | "emergency" | null;
  last_treated_at?: string | null;
  next_action_due_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DentalToothPayload = {
  status?: "healthy" | "attention" | "planned" | "treated" | "monitoring" | "missing" | null;
  condition_label?: string | null;
  surface_summary?: string[];
  notes?: string | null;
  recommendation?: string | null;
  priority?: "routine" | "urgent" | "emergency" | null;
  last_treated_at?: string | null;
  next_action_due_at?: string | null;
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
  dental_profile?: DentalProfile | null;
  dental_chart?: DentalToothRecord[];
  dental_treatments?: DentalTreatmentRecord[];
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
    dental?: {
      chart_status?: string | null;
      emergency_visits_count?: number;
      treatment_records_count?: number;
      profile_completion_score?: number;
      last_diagnosis?: string | null;
      last_clinical_note?: string | null;
      last_clinical_note_at?: string | null;
      last_visit_date?: string | null;
      last_chart_update_at?: string | null;
      charted_teeth_count?: number;
      attention_teeth_count?: number;
      recent_treatment_codes?: string[];
    } | null;
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


export async function upsertDentalProfile(clientId: number, payload: DentalProfilePayload) {
  const r = await api.put(`/clients/${clientId}/dental/profile`, payload);
  return r.data.data as DentalProfile;
}

export async function createDentalTreatment(clientId: number, payload: DentalTreatmentPayload) {
  const r = await api.post(`/clients/${clientId}/dental/treatments`, payload);
  return r.data.data as DentalTreatmentRecord;
}

export async function updateDentalTreatment(clientId: number, recordId: number, payload: Partial<DentalTreatmentPayload>) {
  const r = await api.put(`/clients/${clientId}/dental/treatments/${recordId}`, payload);
  return r.data.data as DentalTreatmentRecord;
}

export async function deleteDentalTreatment(clientId: number, recordId: number) {
  await api.delete(`/clients/${clientId}/dental/treatments/${recordId}`);
}

export async function upsertDentalTooth(clientId: number, toothNumber: string, payload: DentalToothPayload) {
  const r = await api.put(`/clients/${clientId}/dental/chart/${toothNumber}`, payload);
  return r.data.data as DentalToothRecord;
}

export async function deleteDentalTooth(clientId: number, recordId: number) {
  await api.delete(`/clients/${clientId}/dental/chart/${recordId}`);
}
