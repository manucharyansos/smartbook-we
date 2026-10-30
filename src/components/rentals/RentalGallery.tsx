import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { galleryUrl, type GalleryItem } from "../../lib/rentalApi";

const viewerCopy = {
  hy: { close: "Փակել", prev: "Նախորդը", next: "Հաջորդը", open: "Բացել մեծ չափով" },
  ru: { close: "Закрыть", prev: "Предыдущее", next: "Следующее", open: "Открыть крупно" },
  en: { close: "Close", prev: "Previous", next: "Next", open: "Open full size" },
} as const;

export default function RentalGallery({ items }: { items: GalleryItem[] }) {
  const { locale } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const label = viewerCopy[locale] ?? viewerCopy.en;

  return <>
    <div className="rental-gallery">{items.map((item, index) => <figure key={item.id}>
      <button type="button" className="rental-gallery-thumb" onClick={() => setOpenIndex(index)} aria-label={`${label.open}: ${item.caption || rentalCopy[locale].space}`}>
        {item.kind === "video"
          ? <video src={galleryUrl(item)} muted playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
          : <img src={galleryUrl(item)} alt={item.caption || rentalCopy[locale].space} loading="lazy" />}
        {item.kind === "video" ? <span className="rental-gallery-play" aria-hidden="true">▶</span> : null}
      </button>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>)}</div>
    {openIndex !== null && items[openIndex]
      ? <GalleryViewer items={items} index={openIndex} onIndex={setOpenIndex} onClose={() => setOpenIndex(null)} label={label} fallbackAlt={rentalCopy[locale].space} />
      : null}
  </>;
}

function GalleryViewer({ items, index, onIndex, onClose, label, fallbackAlt }: {
  items: GalleryItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  label: (typeof viewerCopy)[keyof typeof viewerCopy];
  fallbackAlt: string;
}) {
  const count = items.length;
  const item = items[index];
  const touchStartX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Lock page scroll while the viewer is open and return focus afterwards.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="rental-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || fallbackAlt}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        const end = event.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
      }}
    >
      <button ref={closeRef} type="button" className="rental-viewer-btn rental-viewer-close" onClick={onClose} aria-label={label.close}><X size={22} /></button>
      {count > 1 ? <div className="rental-viewer-count">{index + 1} / {count}</div> : null}

      <figure className="rental-viewer-stage">
        {item.kind === "video"
          ? <video key={item.id} src={galleryUrl(item)} controls autoPlay playsInline />
          : <img key={item.id} src={galleryUrl(item)} alt={item.caption || fallbackAlt} />}
        {item.caption ? <figcaption>{item.caption}</figcaption> : null}
      </figure>

      {count > 1 ? <>
        <button type="button" className="rental-viewer-btn rental-viewer-prev" onClick={() => go(-1)} aria-label={label.prev}><ChevronLeft size={26} /></button>
        <button type="button" className="rental-viewer-btn rental-viewer-next" onClick={() => go(1)} aria-label={label.next}><ChevronRight size={26} /></button>
      </> : null}
    </div>,
    document.body,
  );
}
