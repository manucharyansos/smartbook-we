import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackRouteChange } from "@/lib/siteAnalytics";

export default function SiteAnalyticsListener() {
  const { pathname } = useLocation();
  useEffect(() => { trackRouteChange(pathname); }, [pathname]);
  return null;
}
