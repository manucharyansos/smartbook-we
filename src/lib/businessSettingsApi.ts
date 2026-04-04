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
};

function mapSettings(data: any): BusinessSettings {
  return {
    ...data,
    logo_url: resolveMediaUrl(data.logo_url),
    cover_url: resolveMediaUrl(data.cover_url),
    locations: Array.isArray(data.locations) ? data.locations : [],
    location_limit: Number(data.location_limit ?? 1),
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
