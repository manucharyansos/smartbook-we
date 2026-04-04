export const SUPPORT_WHATSAPP = "+37498408779";
export const TEST_CLIENT_PHONE = "+37491408828";

export function whatsappLink(phoneE164: string, text?: string) {
    const p = phoneE164.replace(/\+/g, "");
    const t = text ? encodeURIComponent(text) : "";
    return `https://wa.me/${p}${t ? `?text=${t}` : ""}`;
}
