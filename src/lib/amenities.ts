import {
    Accessibility, Baby, Car, ChefHat, Coffee, CreditCard, Presentation, Projector,
    Shirt, Snowflake, Sofa, Speaker, Wifi, type LucideIcon,
} from "lucide-react";
import type { Locale } from "../contexts/LanguageContext";

// Keys match the API catalog (config/amenities.php). Rentals get the general keys plus their own.
export const GENERAL_AMENITIES = [
    "wifi", "parking", "card_payment", "air_conditioning", "wheelchair_access", "kids_corner", "coffee_tea", "waiting_area",
] as const;
export const RENTAL_AMENITIES = ["projector", "whiteboard", "sound_system", "kitchen", "changing_room"] as const;

export type AmenityKey = (typeof GENERAL_AMENITIES)[number] | (typeof RENTAL_AMENITIES)[number];

const labels: Record<Locale, Record<AmenityKey, string>> = {
    hy: {
        wifi: "Wi-Fi", parking: "Կայանատեղի", card_payment: "Քարտով վճարում", air_conditioning: "Օդորակիչ",
        wheelchair_access: "Սայլակով մուտք", kids_corner: "Մանկական անկյուն", coffee_tea: "Սուրճ և թեյ", waiting_area: "Սպասասրահ",
        projector: "Պրոյեկտոր", whiteboard: "Գրատախտակ", sound_system: "Ձայնային համակարգ", kitchen: "Խոհանոց", changing_room: "Զգեստափոխարան",
    },
    ru: {
        wifi: "Wi-Fi", parking: "Парковка", card_payment: "Оплата картой", air_conditioning: "Кондиционер",
        wheelchair_access: "Доступ для колясок", kids_corner: "Детский уголок", coffee_tea: "Кофе и чай", waiting_area: "Зона ожидания",
        projector: "Проектор", whiteboard: "Доска", sound_system: "Звуковая система", kitchen: "Кухня", changing_room: "Раздевалка",
    },
    en: {
        wifi: "Wi-Fi", parking: "Parking", card_payment: "Card payment", air_conditioning: "Air conditioning",
        wheelchair_access: "Wheelchair access", kids_corner: "Kids corner", coffee_tea: "Coffee & tea", waiting_area: "Waiting area",
        projector: "Projector", whiteboard: "Whiteboard", sound_system: "Sound system", kitchen: "Kitchen", changing_room: "Changing room",
    },
};

const icons: Record<AmenityKey, LucideIcon> = {
    wifi: Wifi, parking: Car, card_payment: CreditCard, air_conditioning: Snowflake, wheelchair_access: Accessibility,
    kids_corner: Baby, coffee_tea: Coffee, waiting_area: Sofa, projector: Projector, whiteboard: Presentation,
    sound_system: Speaker, kitchen: ChefHat, changing_room: Shirt,
};

export function isAmenityKey(value: string): value is AmenityKey {
    return value in icons;
}

export function amenityLabel(key: string, locale: Locale): string {
    return isAmenityKey(key) ? labels[locale][key] : key;
}

export function amenityIcon(key: string): LucideIcon {
    return isAmenityKey(key) ? icons[key] : Sofa;
}

export function amenityOptions(isRental: boolean): AmenityKey[] {
    return isRental ? [...GENERAL_AMENITIES, ...RENTAL_AMENITIES] : [...GENERAL_AMENITIES];
}
