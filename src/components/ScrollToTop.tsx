import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (location.hash) return;

    // On route changes inside the SPA, force the document back to the top.
    // This avoids carrying the previous page's scroll position into the next page.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const doc = document.scrollingElement;
    if (doc) {
      doc.scrollTop = 0;
      doc.scrollLeft = 0;
    }
  }, [location.pathname, location.search, navigationType, location.hash]);

  return null;
}
