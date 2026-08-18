import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;

    // Force immediate scroll — before AnimatePresence renders new page
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }

    window.scrollTo(0, 0);
  }, [location.hash, location.pathname]);

  return null;
}
