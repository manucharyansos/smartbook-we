import axios from "axios";
import { resolveMediaUrl } from "./mediaUrl";

const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export type PublicLocation = {
    id: number;
    name?: string | null;
    address: string;
    phone?: string | null;
    is_primary: boolean;
};

export type PublicBusiness = {
    id: number;
    name: string;
    slug: string;
    business_type: "beauty" | "dental";
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

export type PublicService = {
    id: number;
    name: string;
    duration_minutes: number;
    price: number | null;
    currency: string;
    is_active: boolean;
    image_url?: string | null;
};

export type PublicStaff = {
    id: number;
    name: string;
    role: string;
    avatar_url?: string | null;
    bio?: string | null;
    is_bookable: boolean;
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
        business_type?: "beauty" | "dental";
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

export async function fetchPublicBusinesses(params?: {
    type?: "beauty" | "dental" | "all";
    search?: string;
    featured?: boolean;
    per_page?: number;
}): Promise<PublicDirectoryBusiness[]> {
    const query: Record<string, string | number> = {};

    if (params?.type && params.type !== "all") {
        query.type = params.type;
    }

    if (params?.search) {
        query.search = params.search;
    }

    if (params?.featured) {
        query.featured = 1;
    }

    if (params?.per_page) {
        query.per_page = params.per_page;
    }

    const { data } = await publicApi.get("/public/businesses", { params: query });
    return (data.data || data).map((item: PublicDirectoryBusiness) => ({
        ...item,
        cover_url: resolveMediaUrl(item.cover_url),
        logo_url: resolveMediaUrl(item.logo_url),
    }));
}

export async function fetchPublicBusiness(slug: string): Promise<PublicBusiness> {
    const { data } = await publicApi.get(`/public/businesses/${slug}`);
    return {
        ...data,
        cover_url: resolveMediaUrl(data.cover_url),
        logo_url: resolveMediaUrl(data.logo_url),
    };
}

export async function fetchPublicServices(slug: string): Promise<PublicService[]> {
    const { data } = await publicApi.get(`/public/businesses/${slug}/services`);
    return (data.data || data).map((item: PublicService) => ({
        ...item,
        image_url: resolveMediaUrl(item.image_url),
    }));
}

export async function fetchPublicStaff(slug: string): Promise<PublicStaff[]> {
    const { data } = await publicApi.get(`/public/businesses/${slug}/staff`);
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
}): Promise<Slot[]> {
    const { slug, ...query } = params;
    const { data } = await publicApi.get(`/public/businesses/${slug}/availability`, {
        params: query,
    });
    return data.data || data;
}

export async function fetchPublicAvailabilityMulti(params: {
    slug: string;
    service_ids: number[];
    date: string;
    staff_id?: number;
}): Promise<Slot[]> {
    const { slug, ...query } = params;
    const { data } = await publicApi.get(`/public/businesses/${slug}/availability/multi`, {
        params: query,
        paramsSerializer: {
            serialize: (params) => {
                const search = new URLSearchParams();
                params.service_ids?.forEach((id: number) => search.append("service_ids[]", String(id)));
                if (params.date) search.append("date", params.date);
                if (params.staff_id) search.append("staff_id", String(params.staff_id));
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

export async function resendPublicBookingCode(bookingCode: string): Promise<{ ok: boolean; expires_at?: string; message?: string }> {
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
