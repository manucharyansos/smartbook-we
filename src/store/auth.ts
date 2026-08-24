import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
    business_name: string;
    id: number;
    name: string;
    email: string;
    role: string;
    business_id: number | null;
    business_slug?: string | null;
    business_type?: string | null;
    vertical?: string | null;
    billing_status?: string;
    is_billable?: boolean;
    needs_onboarding?: boolean;
    phone?: string | null;
    audience?: "business" | "client";
    email_verified?: boolean;
    requires_email_verification?: boolean;
};

type AuthState = {
    token: string | null;
    user: User | null;

    /** Storage hydration flag (used by route guards). */
    bootstrapped: boolean;

    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    setAuth: (token: string, user: User) => void;
    clear: () => void;

    /** Backwards compatibility for older guards that call it manually. */
    bootstrapFromStorage: () => void;
};

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            bootstrapped: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setAuth: (token, user) => set({ token, user }),
            clear: () => set({ token: null, user: null }),

            bootstrapFromStorage: () => {
                if (!get().bootstrapped) set({ bootstrapped: true });
            },
        }),
        {
            name: "bb_auth",
            partialize: (s) => ({ token: s.token, user: s.user }),
            onRehydrateStorage: () => (state) => {
                // Zustand rehydrates automatically; we just flip the flag.
                state?.bootstrapFromStorage?.();
            },
        }
    )
);
