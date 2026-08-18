export const SUPPORT_PHONE = "+37498408879";
export const SUPPORT_PHONE_DISPLAY = "+374 98 408 879";
export const SUPPORT_WHATSAPP = SUPPORT_PHONE;
export const SUPPORT_EMAIL = "info@vizit.am";

export function whatsappLink(phoneE164: string, text?: string) {
    const p = phoneE164.replace(/\+/g, "");
    const t = text ? encodeURIComponent(text) : "";
    return `https://wa.me/${p}${t ? `?text=${t}` : ""}`;
}

export function safeExternalUrl(value?: string | null): string | null {
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
}
