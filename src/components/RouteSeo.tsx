import { useLocation } from "react-router-dom";

import { useLanguage, type Locale } from "../contexts/LanguageContext";
import Seo from "./Seo";

type MetaCopy = Record<Locale, { title: string; description: string }>;

const routeMeta: Record<string, MetaCopy> = {
  "/": {
    hy: { title: "Vizit.am — օնլայն ամրագրում ծառայությունների և բժշկական այցերի համար", description: "Գտեք ծառայություններն ու բժշկական կենտրոնները, ընտրեք բիզնեսը և ամրագրեք ազատ ժամը Vizit.am-ում։" },
    ru: { title: "Vizit.am — онлайн-запись на услуги и медицинские визиты", description: "Находите услуги и медицинские центры, выбирайте бизнес и бронируйте удобное время на Vizit.am." },
    en: { title: "Vizit.am — online booking for services and medical visits", description: "Find services and medical centers, choose a business and book an available time on Vizit.am." },
  },
  "/features": {
    hy: { title: "Vizit-ի հնարավորությունները բիզնեսների համար", description: "Կառավարեք ամրագրումները, օրացույցը, ծառայությունները, թիմը և հաճախորդներին մեկ հարթակում։" },
    ru: { title: "Возможности Vizit для бизнеса", description: "Управляйте записями, календарём, услугами, командой и клиентами на одной платформе." },
    en: { title: "Vizit features for businesses", description: "Manage bookings, calendars, services, staff and clients from one platform." },
  },
  "/pricing": {
    hy: { title: "Vizit-ի գնային պլանները", description: "Ընտրեք ձեր բիզնեսի չափին համապատասխան Vizit պլանը և սկսեք 14-օրյա փորձաշրջանը։" },
    ru: { title: "Тарифы Vizit", description: "Выберите тариф Vizit под размер вашего бизнеса и начните 14-дневный пробный период." },
    en: { title: "Vizit pricing", description: "Choose a Vizit plan that fits your business and start a 14-day trial." },
  },
  "/about": {
    hy: { title: "Vizit-ի մասին", description: "Ծանոթացեք Vizit.am օնլայն ամրագրման հարթակին և մեր նպատակին։" },
    ru: { title: "О Vizit", description: "Узнайте больше о платформе онлайн-записи Vizit.am и нашей миссии." },
    en: { title: "About Vizit", description: "Learn more about the Vizit.am online booking platform and our mission." },
  },
  "/contact": {
    hy: { title: "Կապ Vizit-ի թիմի հետ", description: "Գրեք կամ զանգահարեք Vizit-ի թիմին համագործակցության, միացման և այլ հարցերով։" },
    ru: { title: "Связаться с командой Vizit", description: "Напишите или позвоните команде Vizit по вопросам подключения и сотрудничества." },
    en: { title: "Contact the Vizit team", description: "Message or call the Vizit team about onboarding, partnerships or support." },
  },
  "/support": {
    hy: { title: "Vizit աջակցություն", description: "Ստացեք օգնություն Vizit-ի կարգավորումների, վճարումների և ամրագրման հոսքերի վերաբերյալ։" },
    ru: { title: "Поддержка Vizit", description: "Получите помощь с настройками, оплатой и процессом бронирования Vizit." },
    en: { title: "Vizit support", description: "Get help with Vizit setup, payments and booking flows." },
  },
  "/faq": {
    hy: { title: "Հաճախ տրվող հարցեր | Vizit", description: "Vizit.am-ի գրանցման, ամրագրումների և պլանների մասին հարցերի պատասխաններ։" },
    ru: { title: "Частые вопросы | Vizit", description: "Ответы на частые вопросы о регистрации, бронировании и тарифах Vizit.am." },
    en: { title: "Frequently asked questions | Vizit", description: "Answers to common questions about Vizit.am registration, bookings and plans." },
  },
  "/privacy-policy": {
    hy: { title: "Գաղտնիության քաղաքականություն | Vizit", description: "Կարդացեք Vizit-ի գաղտնիության քաղաքականությունը։" },
    ru: { title: "Политика конфиденциальности | Vizit", description: "Ознакомьтесь с политикой конфиденциальности Vizit." },
    en: { title: "Privacy policy | Vizit", description: "Read the Vizit privacy policy." },
  },
  "/terms": {
    hy: { title: "Օգտագործման պայմաններ | Vizit", description: "Կարդացեք Vizit հարթակի օգտագործման պայմանները։" },
    ru: { title: "Условия использования | Vizit", description: "Ознакомьтесь с условиями использования платформы Vizit." },
    en: { title: "Terms of use | Vizit", description: "Read the terms for using the Vizit platform." },
  },
  "/cookies": {
    hy: { title: "Cookie-ների քաղաքականություն | Vizit", description: "Իմացեք, թե ինչպես է Vizit-ը օգտագործում cookie-ները։" },
    ru: { title: "Политика cookie | Vizit", description: "Узнайте, как Vizit использует файлы cookie." },
    en: { title: "Cookie policy | Vizit", description: "Learn how Vizit uses cookies." },
  },
};

const noIndexPrefixes = ["/login", "/register", "/forgot-password", "/reset-password", "/business/", "/client/", "/admin", "/app", "/payment-return", "/auth/", "/mock-bank"];

export function RouteSeo() {
  const { pathname } = useLocation();
  const { locale } = useLanguage();
  const meta = routeMeta[pathname];

  if (meta) {
    return <Seo title={meta[locale].title} description={meta[locale].description} />;
  }

  if (noIndexPrefixes.some((prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix))) {
    return <Seo title="Vizit" description="Vizit account access" robots="noindex,nofollow" />;
  }

  if (["/blog", "/careers", "/press"].includes(pathname)) {
    return <Seo title="Vizit" description="Vizit" robots="noindex,follow" />;
  }

  return null;
}
