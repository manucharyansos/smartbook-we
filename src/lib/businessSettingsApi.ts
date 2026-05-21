import { api } from "./api";
import { resolveMediaUrl } from "./mediaUrl";

export type BusinessLocation = {
  id: number;
  name?: string | null;
  address: string;
  phone?: string | null;
  is_primary: boolean;
  sort_order: number;
};

function normalizeTime(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const time = value.trim();
  if (!time) return undefined;
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  return time.slice(0, 5);
}

export type BusinessSettings = {
  name: string;
  slug: string;
  business_type: 'beauty' | 'dental';
  phone: string | null;
  address: string | null;
  timezone: string;
  slot_step_minutes: number;
  work_start?: string;
  work_end?: string;
  short_description?: string | null;
  description?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  whatsapp_phone?: string | null;
  whatsapp_url?: string | null;
  messenger_url?: string | null;
  website_url?: string | null;
  is_public_profile_enabled?: boolean;
  is_marketplace_visible?: boolean;
  show_logo?: boolean;
  show_cover?: boolean;
  show_staff?: boolean;
  show_services?: boolean;
  is_onboarding_completed?: boolean;
  locations?: BusinessLocation[];
  location_limit?: number;
  service_limit?: number | null;
  plan?: { code?: string | null; name?: string | null } | null;
  usage?: {
    active_staff: number;
    staff_limit: number | null;
    staff_remaining: number | null;
    services_count: number;
    services_limit: number | null;
    services_remaining: number | null;
    locations_count: number;
    locations_limit: number;
    locations_remaining: number;
  };
};

function mapSettings(data: any): BusinessSettings {
  return {
    ...data,
    work_start: normalizeTime(data.work_start),
    work_end: normalizeTime(data.work_end),
    logo_url: resolveMediaUrl(data.logo_url),
    cover_url: resolveMediaUrl(data.cover_url),
    locations: Array.isArray(data.locations) ? data.locations : [],
    location_limit: Number(data.location_limit ?? 1),
    service_limit: data.service_limit == null ? null : Number(data.service_limit),
    plan: data.plan ?? null,
    usage: data.usage ? {
      active_staff: Number(data.usage.active_staff ?? 0),
      staff_limit: data.usage.staff_limit == null ? null : Number(data.usage.staff_limit),
      staff_remaining: data.usage.staff_remaining == null ? null : Number(data.usage.staff_remaining),
      services_count: Number(data.usage.services_count ?? 0),
      services_limit: data.usage.services_limit == null ? null : Number(data.usage.services_limit),
      services_remaining: data.usage.services_remaining == null ? null : Number(data.usage.services_remaining),
      locations_count: Number(data.usage.locations_count ?? 0),
      locations_limit: Number(data.usage.locations_limit ?? data.location_limit ?? 1),
      locations_remaining: Number(data.usage.locations_remaining ?? 0),
    } : undefined,
  };
}

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  const r = await api.get("/business/settings");
  return mapSettings(r.data.data);
}

export async function updateBusinessSettings(payload: Partial<{
  phone: string | null;
  address: string | null;
  timezone: string;
  slot_step_minutes: number;
  work_start: string;
  work_end: string;
  short_description: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp_phone: string | null;
  whatsapp_url: string | null;
  website_url: string | null;
  messenger_url: string | null;
  is_public_profile_enabled: boolean;
  is_marketplace_visible: boolean;
  show_logo: boolean;
  show_cover: boolean;
  show_staff: boolean;
  show_services: boolean;
}>): Promise<BusinessSettings> {
  const normalizedPayload = {
    ...payload,
    ...(Object.prototype.hasOwnProperty.call(payload, 'work_start') ? { work_start: normalizeTime(payload.work_start) ?? null } : {}),
    ...(Object.prototype.hasOwnProperty.call(payload, 'work_end') ? { work_end: normalizeTime(payload.work_end) ?? null } : {}),
    ...(payload.whatsapp_phone && !payload.whatsapp_url ? { whatsapp_url: `https://wa.me/${payload.whatsapp_phone.replace(/\D/g, "")}` } : {}),
  };
  const r = await api.patch("/business/settings", normalizedPayload);
  return mapSettings(r.data.data);
}

export async function createBusinessLocation(payload: {
  name?: string | null;
  address: string;
  phone?: string | null;
  is_primary?: boolean;
}): Promise<{ locations: BusinessLocation[]; location_limit: number }> {
  const r = await api.post('/business/locations', payload);
  return {
    locations: r.data.data.locations ?? [],
    location_limit: Number(r.data.data.location_limit ?? 1),
  };
}

export async function updateBusinessLocation(locationId: number, payload: {
  name?: string | null;
  address: string;
  phone?: string | null;
  is_primary?: boolean;
}): Promise<{ locations: BusinessLocation[]; location_limit: number }> {
  const r = await api.patch(`/business/locations/${locationId}`, payload);
  return {
    locations: r.data.data.locations ?? [],
    location_limit: Number(r.data.data.location_limit ?? 1),
  };
}

export async function deleteBusinessLocation(locationId: number): Promise<{ locations: BusinessLocation[]; location_limit: number }> {
  const r = await api.delete(`/business/locations/${locationId}`);
  return {
    locations: r.data.data.locations ?? [],
    location_limit: Number(r.data.data.location_limit ?? 1),
  };
}
