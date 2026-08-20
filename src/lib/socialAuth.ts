export type PendingSocialBusinessProfile = {
  business_name: string;
  business_phone: string;
  business_address: string;
  latitude: number;
  longitude: number;
  provider: "google" | "facebook";
  created_at: number;
};

const PENDING_BUSINESS_PROFILE_KEY = "vizit:social-business-profile";
const MAX_PROFILE_AGE_MS = 15 * 60 * 1000;

export function storePendingSocialBusinessProfile(
  profile: Omit<PendingSocialBusinessProfile, "created_at">,
) {
  try {
    sessionStorage.setItem(PENDING_BUSINESS_PROFILE_KEY, JSON.stringify({
      ...profile,
      created_at: Date.now(),
    }));
  } catch {
    // The backend will return a clear validation error if session storage is
    // unavailable and the registration profile cannot be completed.
  }
}

export function getPendingSocialBusinessProfile(): PendingSocialBusinessProfile | null {
  try {
    const raw = sessionStorage.getItem(PENDING_BUSINESS_PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingSocialBusinessProfile>;
    if (
      !parsed.business_name ||
      !parsed.business_phone ||
      !parsed.business_address ||
      !Number.isFinite(parsed.latitude) ||
      !Number.isFinite(parsed.longitude) ||
      (parsed.provider !== "google" && parsed.provider !== "facebook") ||
      !parsed.created_at ||
      Date.now() - parsed.created_at > MAX_PROFILE_AGE_MS
    ) {
      sessionStorage.removeItem(PENDING_BUSINESS_PROFILE_KEY);
      return null;
    }

    return parsed as PendingSocialBusinessProfile;
  } catch {
    return null;
  }
}

export function clearPendingSocialBusinessProfile() {
  try {
    sessionStorage.removeItem(PENDING_BUSINESS_PROFILE_KEY);
  } catch {
    // Storage cleanup must not turn a successful sign-in into an error.
  }
}
