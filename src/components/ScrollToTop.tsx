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

    const root = document.documentElement;
    const body = document.body;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;

    // The global design system uses smooth scrolling. Temporarily override it
    // so a route change opens at the top immediately instead of animating from
    // the previous page's scroll position.
    root.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    const scrollToPageTop = () => {
      root.scrollTop = 0;
      body.scrollTop = 0;

      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    };
    const restoreScrollBehavior = () => {
      root.style.scrollBehavior = previousRootScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
    };

    scrollToPageTop();
    let secondAnimationFrame = 0;
    const firstAnimationFrame = window.requestAnimationFrame(() => {
      scrollToPageTop();
      secondAnimationFrame = window.requestAnimationFrame(scrollToPageTop);
    });
    const delayedReset = window.setTimeout(() => {
      scrollToPageTop();
      restoreScrollBehavior();
    }, 80);

    return () => {
      window.cancelAnimationFrame(firstAnimationFrame);
      window.cancelAnimationFrame(secondAnimationFrame);
      window.clearTimeout(delayedReset);
      restoreScrollBehavior();
    };
  }, [location.hash, location.pathname]);

  return null;
}
