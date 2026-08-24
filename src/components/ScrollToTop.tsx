import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (location.hash) return;
    // Let the browser restore the previous position on back/forward navigation.
    if (navigationType === "POP") return;

    // Force immediate scroll — before AnimatePresence renders new page
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }

    window.scrollTo(0, 0);
  }, [location.hash, location.pathname, navigationType]);

  return null;
}
