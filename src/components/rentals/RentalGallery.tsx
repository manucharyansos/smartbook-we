import { useLanguage } from "../../contexts/LanguageContext";
import { rentalCopy } from "../../i18n/rentals";
import { galleryUrl, type GalleryItem } from "../../lib/rentalApi";

export default function RentalGallery({ items }: { items: GalleryItem[] }) {
  const { locale } = useLanguage();
  return <div className="rental-gallery">{items.map((item) => <figure key={item.id}>
    {item.kind === "video" ? <video src={galleryUrl(item)} controls playsInline preload="metadata" aria-label={item.caption || rentalCopy[locale].gallery} />
      : <a href={galleryUrl(item)} target="_blank" rel="noopener noreferrer"><img src={galleryUrl(item)} alt={item.caption || rentalCopy[locale].space} loading="lazy" /></a>}
    {item.caption && <figcaption>{item.caption}</figcaption>}
  </figure>)}</div>;
}
