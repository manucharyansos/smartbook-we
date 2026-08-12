import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "./apiBase";
import { resolveMediaUrl } from "./mediaUrl";

const publicApi = axios.create({
    baseURL: API_BASE_URL,
});

function normalizePublicBusinessType(value: unknown): "beauty" | "dental" {
    return ["dental", "clinic", "healthcare", "medical", "doctor", "health"].includes(String(value ?? "").toLowerCase()) ? "dental" : "beauty";
}

function normalizePublicBusinessItem<T extends { business_type?: unknown; vertical?: unknown }>(item: T): Omit<T, "business_type"> & { business_type: "beauty" | "dental" } {
    return {
        ...item,
        business_type: normalizePublicBusinessType(item.business_type ?? item.vertical),
    };
}

export type PublicLocation = {
    id: number;
    name?: string | null;
    address: string;
    city?: string | null;
    district?: string | null;
    lat?: number | null;
    lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    is_primary: boolean;
};

export type PublicBusinessCategory = {
    id?: number;
    slug?: string | null;
    vertical?: "services" | "healthcare" | "beauty" | "dental" | "salon" | "clinic" | string | null;
    name?: string | null;
    name_hy?: string | null;
    name_ru?: string | null;
    name_en?: string | null;
    description?: string | null;
    icon?: string | null;
};

export type PublicBusiness = {
    id: number;
    name: string;
    slug: string;
    business_type: "beauty" | "dental";
    vertical?: "services" | "healthcare" | string | null;
    category?: PublicBusinessCategory | null;
    custom_category_name?: string | null;
    address?: string | null;
    phone?: string | null;
    locations?: PublicLocation[];
    work_start: string | null;
    work_end: string | null;
    timezone: string | null;
    short_description?: string | null;
    cover_url?: string | null;
    logo_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    whatsapp_phone?: string | null;
    whatsapp_url?: string | null;
    messenger_url?: string | null;
    website_url?: string | null;
    description?: string | null;
    show_logo?: boolean;
    show_cover?: boolean;
    show_staff?: boolean;
    show_services?: boolean;
    settings?: {
        has_rooms: boolean;
        has_patients: boolean;
        phone_verification?: boolean;
    };
};

export type PublicDirectoryBusiness = {
    id: number;
    name: string;
    slug: string;
    business_type: "beauty" | "dental";
    vertical?: "services" | "healthcare" | string | null;
    category?: PublicBusinessCategory | null;
    custom_category_name?: string | null;
    address: string | null;
    phone: string | null;
    locations?: PublicLocation[];
    timezone: string | null;
    work_start: string | null;
    work_end: string | null;
    short_description: string | null;
    cover_url: string | null;
    logo_url: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    whatsapp_phone?: string | null;
    whatsapp_url?: string | null;
    messenger_url?: string | null;
    website_url?: string | null;
    services_count: number;
    staff_count: number;
    is_featured: boolean;
};


export type PublicMapPin = {
    business_id: number;
    name: string;
    slug: string;
    vertical?: string | null;
    category_slug?: string | null;
    category_name?: string | null;
    icon?: string | null;
    location_id: number;
    location_name?: string | null;
    address?: string | null;
    lat: number;
    lng: number;
    distance_km?: number | null;
    booking_url?: string | null;
};

export type PublicService = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | null;
    currency: string;
    is_active: boolean;
    image_url?: string | null;
    location_id?: number | null;
};

export type PublicStaff = {
    id: number;
    name: string;
    role: string;
    avatar_url?: string | null;
    bio?: string | null;
    is_bookable: boolean;
    location_id?: number | null;
};

export type Slot = {
    starts_at: string;
    ends_at: string;
    staff_id?: number;
    staff_name?: string | null;
    smart_score?: number;
    smart_reason?: string | null;
    is_recommended?: boolean;
    recommendation_rank?: number | null;
    gap_before_minutes?: number;
    gap_after_minutes?: number;
    available_rooms?: Array<{
        id: number;
        name: string;
        type?: string | null;
    }>;
};

export type PublicBookingResponse = {
    data: {
        booking_code: string | null;
        group_id?: string | null;
        needs_phone_verification: boolean;
        phone: string;
        expires_at: string;
    };
    meta?: {
        business_type?: "services" | "healthcare";
    };
};

export type PublicBookingDetail = {
    booking_code: string;
    status: string;
    status_label?: string;
    client_name: string;
    client_phone: string;
    client_email?: string | null;
    notes?: string | null;
    phone_verified_at?: string | null;
    guest_access_expires_at?: string | null;
    can_cancel?: boolean;
    total_price?: number | null;
    currency?: string | null;
    business: {
        id: number;
        name: string;
        slug: string;
        business_type: "beauty" | "dental";
        address?: string | null;
        phone?: string | null;
        timezone?: string | null;
    };
    primary_booking?: PublicBookingItem | null;
    bookings: PublicBookingItem[];
};

export type PublicBookingItem = {
    id: number;
    booking_code: string;
    status: string;
    starts_at: string;
    ends_at: string;
    final_price?: number | null;
    currency?: string | null;
    service?: {
        id: number;
        name: string;
        duration_minutes?: number | null;
        price?: number | null;
        currency?: string | null;
    } | null;
    staff?: {
        id: number;
        name: string;
    } | null;
    items?: Array<{
        id: number;
        position: number;
        duration_minutes: number;
        price?: number | null;
        currency?: string | null;
        service?: {
            id: number;
            name: string;
            duration_minutes?: number | null;
            price?: number | null;
            currency?: string | null;
        } | null;
    }>;
};

export type PublicVerifyBookingResponse = {
    ok: boolean;
    already?: boolean;
    manage_token?: string;
    manage_url?: string;
    data: PublicBookingDetail;
};


export async function fetchPublicCategories(params?: {
    vertical?: "services" | "healthcare" | "beauty" | "dental" | "salon" | "clinic" | string;
    locale?: string;
}): Promise<PublicBusinessCategory[]> {
    const query: Record<string, string> = {};
    if (params?.vertical) query.vertical = params.vertical;
    if (params?.locale) query.locale = params.locale;

    const endpoints = ["/v1/public/categories", "/public/categories"];

    for (const endpoint of endpoints) {
        try {
            const { data } = await publicApi.get(endpoint, { params: query });
            const list = data?.data || data?.categories || data;
            if (Array.isArray(list)) {
                return list;
            }
        } catch {
            // Not all backend builds have category endpoints yet.
            // Do not break the public site; callers can derive categories from businesses.
        }
    }

    return [];
}

function extractBusinessList(payload: unknown): PublicDirectoryBusiness[] {
    const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const list: unknown[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.businesses)
            ? data.businesses
            : Array.isArray(payload)
                ? payload
                : [];

    return list.map((value) => {
        const item = value as PublicDirectoryBusiness;
        return {
            ...normalizePublicBusinessItem(item),
            cover_url: resolveMediaUrl(item.cover_url),
            logo_url: resolveMediaUrl(item.logo_url),
        };
    });
}

function buildPublicBusinessQuery(params?: {
    type?: "services" | "healthcare" | "beauty" | "dental" | "all";
    search?: string;
    featured?: boolean;
    per_page?: number;
}, includePerPage = true): Record<string, string | number> {
    const query: Record<string, string | number> = {};

    if (params?.type && params.type !== "all") {
        query.type = params.type;
    }

    if (params?.search?.trim()) {
        query.search = params.search.trim();
    }

    if (params?.featured) {
        query.featured = 1;
    }

    if (includePerPage && params?.per_page) {
        query.per_page = params.per_page;
    }

    return query;
}

export async function fetchPublicBusinesses(params?: {
    type?: "services" | "healthcare" | "beauty" | "dental" | "all";
    search?: string;
    featured?: boolean;
    per_page?: number;
}): Promise<PublicDirectoryBusiness[]> {
    const endpoints = ["/v1/public/businesses", "/public/businesses"];
    const attempts: Array<Record<string, string | number>> = [
        buildPublicBusinessQuery(params, true),
        buildPublicBusinessQuery(params, false),
        {},
    ];

    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        for (const query of attempts) {
            try {
                const { data } = await publicApi.get(endpoint, { params: query });
                return extractBusinessList(data);
            } catch (error) {
                lastError = error;
                const status = (error as AxiosError)?.response?.status;
                // 404 means this endpoint version is missing; try the next route.
                // 422 means the backend does not accept one of our optional query params; try simpler params.
                if (status === 404 || status === 422) continue;
            }
        }
    }

    throw lastError;
}



type RawPublicMapPin = {
    business_id?: unknown;
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    vertical?: unknown;
    category_slug?: unknown;
    category_name?: unknown;
    icon?: unknown;
    location_id?: unknown;
    location_name?: unknown;
    address?: unknown;
    lat?: unknown;
    lng?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    distance_km?: unknown;
    booking_url?: unknown;
    category?: { slug?: unknown; name?: unknown; name_hy?: unknown } | null;
    location?: { id?: unknown; name?: unknown; address?: unknown; lat?: unknown; lng?: unknown; latitude?: unknown; longitude?: unknown } | null;
};

function normalizeMapPin(pin: RawPublicMapPin): PublicMapPin {
    const slug = String(pin.slug ?? "");
    const categorySlug = pin.category_slug ?? pin.category?.slug;
    const categoryName = pin.category_name ?? pin.category?.name ?? pin.category?.name_hy;

    return {
        business_id: Number(pin.business_id ?? pin.id),
        name: String(pin.name ?? ""),
        slug,
        vertical: pin.vertical == null ? null : String(pin.vertical),
        category_slug: categorySlug == null ? null : String(categorySlug),
        category_name: categoryName == null ? null : String(categoryName),
        icon: pin.icon == null ? null : String(pin.icon),
        location_id: Number(pin.location_id ?? pin.location?.id ?? pin.id),
        location_name: pin.location_name == null && pin.location?.name == null ? null : String(pin.location_name ?? pin.location?.name),
        address: pin.address == null && pin.location?.address == null ? null : String(pin.address ?? pin.location?.address),
        lat: Number(pin.lat ?? pin.latitude ?? pin.location?.lat ?? pin.location?.latitude),
        lng: Number(pin.lng ?? pin.longitude ?? pin.location?.lng ?? pin.location?.longitude),
        distance_km: pin.distance_km == null ? null : Number(pin.distance_km),
        booking_url: pin.booking_url == null ? (slug ? `/book/${slug}` : null) : String(pin.booking_url),
    };
}

function extractMapPins(payload: unknown): PublicMapPin[] {
    const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    const list: unknown[] = Array.isArray(data.data) ? data.data : Array.isArray(data.pins) ? data.pins : Array.isArray(payload) ? payload : [];

    return list
        .map((pin) => normalizeMapPin(pin as RawPublicMapPin))
        .filter((pin: PublicMapPin) => Number.isFinite(pin.lat) && Number.isFinite(pin.lng) && !!pin.slug);
}

export async function fetchPublicMapPins(params?: {
    type?: "services" | "healthcare" | "beauty" | "dental" | "all";
    vertical?: string;
    category?: string;
    category_id?: number;
    lat?: number;
    lng?: number;
    radius?: number;
    search?: string;
}): Promise<PublicMapPin[]> {
    const query: Record<string, string | number> = {};
    if (params?.type && params.type !== "all") query.type = params.type;
    if (params?.vertical) query.vertical = params.vertical;
    if (params?.category) query.category = params.category;
    if (params?.category_id) query.category_id = params.category_id;
    if (typeof params?.lat === "number") query.lat = params.lat;
    if (typeof params?.lng === "number") query.lng = params.lng;
    if (typeof params?.radius === "number") query.radius = params.radius;
    if (params?.search?.trim()) query.search = params.search.trim();

    const endpoints = ["/v1/public/businesses/map", "/public/businesses/map"];
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const { data } = await publicApi.get(endpoint, { params: query });
            return extractMapPins(data);
        } catch (error) {
            lastError = error;
            const status = (error as AxiosError)?.response?.status;
            if (status === 404 || status === 422) continue;
        }
    }

    throw lastError;
}

export async function fetchPublicBusiness(slug: string): Promise<PublicBusiness> {
    const endpoints = [`/v1/public/businesses/${slug}`, `/public/businesses/${slug}`];
    let lastError: unknown = null;

    for (const endpoint of endpoints) {
        try {
            const { data } = await publicApi.get(endpoint);
            return {
                ...normalizePublicBusinessItem(data?.data ?? data),
                cover_url: resolveMediaUrl((data?.data ?? data).cover_url),
                logo_url: resolveMediaUrl((data?.data ?? data).logo_url),
            } as PublicBusiness;
        } catch (error) {
            lastError = error;
            const status = (error as AxiosError)?.response?.status;
            if (status === 404) continue;
        }
    }

    throw lastError;
}

export async function fetchPublicServices(slug: string, params?: { location_id?: number }): Promise<PublicService[]> {
    const { data } = await publicApi.get(`/public/businesses/${slug}/services`, { params });
    return (data.data || data).map((item: PublicService) => ({
        ...item,
        image_url: resolveMediaUrl(item.image_url),
    }));
}

export async function fetchPublicStaff(slug: string, params?: { location_id?: number; bookable_only?: boolean }): Promise<PublicStaff[]> {
    const { data } = await publicApi.get(`/public/businesses/${slug}/staff`, { params });
    return (data.data || data).map((item: PublicStaff) => ({
        ...item,
        avatar_url: resolveMediaUrl(item.avatar_url),
    }));
}

export async function fetchPublicAvailability(params: {
    slug: string;
    service_id: number;
    date: string;
    staff_id?: number;
    location_id?: number;
}): Promise<Slot[]> {
    const { slug, ...query } = params;
    const { data } = await publicApi.get(`/public/businesses/${slug}/availability`, {
        params: { ...query, _t: Date.now() },
    });
    return data.data || data;
}

export async function fetchPublicAvailabilityMulti(params: {
    slug: string;
    service_ids: number[];
    date: string;
    staff_id?: number;
    location_id?: number;
}): Promise<Slot[]> {
    const { slug, ...query } = params;
    const { data } = await publicApi.get(`/public/businesses/${slug}/availability/multi`, {
        params: { ...query, _t: Date.now() },
        paramsSerializer: {
            serialize: (params) => {
                const search = new URLSearchParams();
                params.service_ids?.forEach((id: number) => search.append("service_ids[]", String(id)));
                if (params.date) search.append("date", params.date);
                if (params.staff_id) search.append("staff_id", String(params.staff_id));
                if (params.location_id) search.append("location_id", String(params.location_id));
                if (params._t) search.append("_t", String(params._t));
                return search.toString();
            },
        },
    });
    return data.data || data;
}

export async function createPublicBooking(payload: {
    slug: string;
    service_id: number;
    staff_id?: number;
    starts_at: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    notes?: string | null;
    room_id?: number;
    source?: string;
    location_id?: number;
    redeem_points?: number;
    gift_card_code?: string;
    gift_card_amount?: number;
}): Promise<PublicBookingResponse> {
    const { slug, ...body } = payload;
    const { data } = await publicApi.post(`/public/businesses/${slug}/bookings`, body);
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function createPublicBookingMulti(payload: {
    slug: string;
    service_ids: number[];
    staff_id?: number;
    starts_at: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    notes?: string | null;
    room_id?: number;
    source?: string;
    location_id?: number;
    redeem_points?: number;
    gift_card_code?: string;
    gift_card_amount?: number;
}): Promise<PublicBookingResponse> {
    const { slug, ...body } = payload;
    const { data } = await publicApi.post(`/public/businesses/${slug}/bookings/multi`, body);
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function createPublicBookingLines(payload: {
    slug: string;
    lines: Array<{
        service_id: number;
        staff_id?: number;
        starts_at: string;
    }>;
    client_name: string;
    client_phone: string;
    client_email?: string;
    notes?: string | null;
    room_id?: number;
    source?: string;
    location_id?: number;
    redeem_points?: number;
    gift_card_code?: string;
    gift_card_amount?: number;
}): Promise<PublicBookingResponse> {
    const { slug, ...body } = payload;
    const { data } = await publicApi.post(`/public/businesses/${slug}/bookings/lines`, body);
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function verifyPublicBooking(payload: {
    booking_code: string;
    otp: string;
}): Promise<PublicVerifyBookingResponse> {
    const { data } = await publicApi.post(`/public/bookings/${payload.booking_code}/verify`, { otp: payload.otp });
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function resendPublicBookingCode(bookingCode: string): Promise<{ ok: boolean; already?: boolean; expires_at?: string; message?: string; manage_token?: string; manage_url?: string; data?: PublicBookingDetail }> {
    const { data } = await publicApi.post(`/public/bookings/${bookingCode}/resend`);
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function fetchPublicBookingDetail(payload: {
    booking_code: string;
    token: string;
}): Promise<{ data: PublicBookingDetail }> {
    const { data } = await publicApi.get(`/public/bookings/${payload.booking_code}`, {
        headers: {
            "X-Guest-Token": payload.token,
        },
    });
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}

export async function cancelPublicBooking(payload: {
    booking_code: string;
    token: string;
}): Promise<{ data: PublicBookingDetail }> {
    const { data } = await publicApi.post(
        `/public/bookings/${payload.booking_code}/cancel`,
        {},
        {
            headers: {
                "X-Guest-Token": payload.token,
            },
        }
    );
    return { ...data, cover_url: resolveMediaUrl(data.cover_url), logo_url: resolveMediaUrl(data.logo_url) };
}
