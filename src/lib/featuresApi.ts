import { api } from "./api";

export type FeaturesResponse = {
  business_id: number | null;
  business_type?: string | null;
  plan_code: string | null;
  plan_name?: string | null;
  features: Record<string, boolean | number | string>;
  subscription?: {
    status?: string | null;
    trial_ends_at?: string | null;
    days_left?: number | null;
    cancel_at_period_end?: boolean;
  };
};

export async function fetchFeatures(): Promise<FeaturesResponse> {
  const r = await api.get("/features");
  return r.data.data as FeaturesResponse;
}

export function hasFeature(features: FeaturesResponse | undefined, key: string): boolean {
  if (!features) return false;
  const v = (features.features as any)?.[key];
  return v === true;
}
