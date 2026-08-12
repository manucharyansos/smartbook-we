import { useEffect } from "react";

type SeoProps = {
  title: string;
  description: string;
  image?: string | null;
  canonical?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | null;
};

function setMeta(selector: string, attr: "content" | "href", value: string) {
  if (!value) return;
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    if (selector.startsWith("meta")) {
      el = document.createElement("meta");
      const prop = selector.match(/property="([^"]+)"/)?.[1];
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (prop) el.setAttribute("property", prop);
      if (name) el.setAttribute("name", name);
    } else {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export default function Seo({ title, description, image, canonical, type = "website", jsonLd }: SeoProps) {
  useEffect(() => {
    const url = canonical || window.location.href;
    const img = image || `${window.location.origin}/og-default.svg`;

    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", "index,follow,max-image-preview:large");
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:locale"]', "content", "hy_AM");
    setMeta('meta[property="og:site_name"]', "content", "Vizit");
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:image"]', "content", img);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", img);

    const id = "vizit-json-ld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script && jsonLd) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    if (script) {
      if (jsonLd) script.textContent = JSON.stringify(jsonLd);
      else script.remove();
    }
  }, [title, description, image, canonical, type, jsonLd]);

  return null;
}
