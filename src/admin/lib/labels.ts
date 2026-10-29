/** Armenian labels for raw API values shown in the super-admin panel. */
const labels: Record<string, string> = {
  pending: "Սպասվում է", approved: "Վճարված", paid: "Վճարված", cancelled: "Չեղարկված", canceled: "Չեղարկված",
  rejected: "Մերժված", failed: "Չհաջողված", active: "Ակտիվ", trialing: "Փորձաշրջան", expired: "Ժամկետանց",
  suspended: "Կասեցված", inactive: "Ակտիվ չէ", past_due: "Ուշացած վճար",
  confirmed: "Հաստատված", done: "Ավարտված", completed: "Ավարտված", in_progress: "Ընթացքում", no_show: "Չի եկել",
  monthly: "Ամսական", yearly: "Տարեկան",
  wallet: "Idram դրամապանակ", card: "Քարտ", manual: "Ձեռքով", free: "Անվճար",
  idram: "Idram", idbank: "IDBank", idbank_mock: "Թեստային բանկ",
  owner: "Սեփականատեր", manager: "Մենեջեր", staff: "Աշխատակից",
  super_admin: "Սուպեր ադմին", admin: "Ադմին", support: "Աջակցություն", finance: "Ֆինանսներ",
};

export function adminLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return labels[value] ?? value;
}

export function verticalLabel(vertical?: string | null, businessType?: string | null): string {
  const value = vertical || businessType || "";
  if (value === "rentals") return "Վարձով տարածքներ";
  if (["healthcare", "dental", "clinic"].includes(value)) return "Առողջապահություն";
  if (["services", "beauty", "salon"].includes(value)) return "Ծառայություններ";
  return value || "—";
}

export function amd(value: number | null | undefined): string {
  return `${new Intl.NumberFormat("hy-AM").format(Number(value ?? 0))} ֏`;
}

export function dateTime(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString("hy-AM", { dateStyle: "medium", timeStyle: "short" }) : "—";
}
