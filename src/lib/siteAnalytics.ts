import { API_BASE_URL } from "./apiBase";

/**
 * Anonymous first-party analytics. No cookies or identifiers are stored in the
 * browser; the API derives a visitor hash that changes every day.
 */
export type SiteEventName =
  | "page_view" | "search" | "business_view" | "booking_started" | "booking_created"
  | "signup_started" | "signup_completed" | "map_open" | "contact_click" | "directions_click";

type QueuedEvent = { event: SiteEventName; path: string; referrer?: string; utm_source?: string; locale?: string };

const queue: QueuedEvent[] = [];
let timer: number | undefined;
let firstView = true;

function disabled() {
  if (typeof window === "undefined" || import.meta.env.MODE === "test") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true || window.location.pathname.startsWith("/admin");
}

function flush() {
  window.clearTimeout(timer);
  timer = undefined;
  if (!queue.length) return;
  const events = queue.splice(0, 20);
  try {
    void fetch(`${API_BASE_URL}/v1/public/analytics/events`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ source: "web", events }),
    }).catch(() => undefined);
  } catch {
    // Analytics must never affect the page.
  }
  if (queue.length) flush();
}

export function trackSiteEvent(event: SiteEventName, path = window.location.pathname) {
  if (disabled()) return;
  const item: QueuedEvent = { event, path, locale: document.documentElement.lang?.slice(0, 5) || undefined };
  if (event === "page_view" && firstView) {
    firstView = false;
    item.referrer = document.referrer || "";
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) item.utm_source = utm.slice(0, 60);
  }
  queue.push(item);
  // The landing view carries the referrer and campaign, so it must not wait for a timer a bounce would cancel.
  if (item.referrer !== undefined || item.utm_source !== undefined || queue.length >= 10) flush();
  else if (!timer) timer = window.setTimeout(flush, 2000);
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);
}

/** Page views plus the funnel steps implied by the URL. */
export function trackRouteChange(pathname: string) {
  trackSiteEvent("page_view", pathname);
  if (/^\/book\/[^/]+/.test(pathname)) trackSiteEvent("booking_started", pathname);
  if (/^\/businesses\/[^/]+$/.test(pathname)) trackSiteEvent("business_view", pathname);
  if (pathname === "/register" || pathname.startsWith("/register/")) trackSiteEvent("signup_started", pathname);
}
