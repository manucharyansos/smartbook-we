import { adminApi } from "./adminApi";
import type { Business, BusinessDetailsResponse } from "../types/admin.types";

export const adminBusinessesApi = {
  list: (params?: Record<string, unknown>) => adminApi.get<{ data: Business[] }>("/businesses", { params }),
  get: (id: number) => adminApi.get<{ data: BusinessDetailsResponse }>(`/businesses/${id}`),
  suspend: (id: number) => adminApi.post(`/businesses/${id}/suspend`),
  restore: (id: number) => adminApi.post(`/businesses/${id}/restore`),
  changePlan: (id: number, planCode: string) => adminApi.post(`/businesses/${id}/plan`, { plan_code: planCode }),
  extendTrial: (id: number, days: number) => adminApi.post(`/businesses/${id}/trial`, { days }),
  createPricingOverride: (id: number, payload: Record<string, unknown>) =>
    adminApi.post(`/businesses/${id}/pricing-overrides`, payload),
  updatePricingOverride: (id: number, overrideId: number, payload: Record<string, unknown>) =>
    adminApi.patch(`/businesses/${id}/pricing-overrides/${overrideId}`, payload),
  deletePricingOverride: (id: number, overrideId: number) =>
    adminApi.delete(`/businesses/${id}/pricing-overrides/${overrideId}`),
  purgePreview: async (id: number) => (await adminApi.get<{ data: PurgePreview }>(`/businesses/${id}/purge-preview`)).data.data,
  purge: (id: number, confirmSlug: string) => adminApi.delete(`/businesses/${id}`, { data: { confirm_slug: confirmSlug } }),
};

export type PurgePreview = {
  business: { id: number; name: string; slug: string; status: string };
  counts: Record<string, number>;
  warnings: string[];
};
