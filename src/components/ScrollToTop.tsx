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

    const documentRoot = document.documentElement;
    const body = document.body;
    const appRoot = document.getElementById("root");
    const previousDocumentScrollBehavior = documentRoot.style.scrollBehavior;
    const previousBodyScrollBehavior = body.style.scrollBehavior;
    const previousAppScrollBehavior = appRoot?.style.scrollBehavior ?? "";

    // The global design system uses smooth scrolling. Temporarily override it
    // so a route change opens at the top immediately instead of animating from
    // the previous page's scroll position.
    documentRoot.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";
    if (appRoot) appRoot.style.scrollBehavior = "auto";

    const scrollToPageTop = () => {
      documentRoot.scrollTop = 0;
      body.scrollTop = 0;
      if (appRoot) appRoot.scrollTop = 0;

      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    };
    const restoreScrollBehavior = () => {
      documentRoot.style.scrollBehavior = previousDocumentScrollBehavior;
      body.style.scrollBehavior = previousBodyScrollBehavior;
      if (appRoot) appRoot.style.scrollBehavior = previousAppScrollBehavior;
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
