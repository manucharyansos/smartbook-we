import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (location.hash) return;

    const scrollToPageTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollToPageTop();
    const animationFrame = window.requestAnimationFrame(scrollToPageTop);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [location.hash, location.key]);

  return null;
}
