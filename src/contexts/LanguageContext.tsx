import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "hy" | "ru" | "en";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const STORAGE_KEY = "vizit-locale";

const dictionaries: Record<Locale, Record<string, string>> = {
  hy: {
    "nav.home": "Գլխավոր",
    "nav.services": "Ծառայություններ",
    "nav.how": "Ինչպես է աշխատում",
    "nav.businesses": "Գործընկերներ",
    "nav.map": "Քարտեզ",
    "nav.pricing": "Գներ",
    "nav.about": "Մեր մասին",
    "nav.contact": "Կապ",
    "nav.login": "Մուտք",
    "nav.start": "Սկսել անվճար",
    "hero.badge": "#1 Օնլայն ամրագրման հարթակ Հայաստանում",
    "hero.title1": "Ամրագրեք ծառայություններ",
    "hero.title2": "արագ և հեշտ",
    "hero.subtitle": "Vizit.am-ը օգնում է գտնել ծառայություններն ու բժշկական այցերը, տեսնել գրանցված բիզնեսները և արագ ամրագրել ազատ ժամը։",
    "search.label": "Ի՞նչ ծառայություն եք փնտրում?",
    "search.placeholder": "Օրինակ՝ pro, սրահ, ատամնաբույժ",
    "search.location": "Վայրը",
    "search.city": "Երևան",
    "search.button": "Որոնել",
    "popular": "Հանրաճանաչ որոնումներ՝",
    "categories.title": "Բացահայտեք ծառայությունները",
    "categories.all": "Բոլոր կատեգորիաները",
    "categories.empty.title": "Կատեգորիաներ դեռ չկան",
    "categories.empty.text": "Շուտով այստեղ կտեսնես հասանելի կատեգորիաները։",
    "how.title": "Ինչո՞ւ ընտրել Vizit.am-ը",
    "businesses.badge": "Գրանցված բիզնեսներ",
    "businesses.title": "Ընտրիր բիզնեսը և ամրագրիր ազատ ժամը",
    "businesses.text": "Գտիր քեզ հարմար բիզնեսը և ամրագրիր ազատ ժամը։",
    "businesses.all": "Բոլորը",
    "businesses.services": "Ծառայություններ",
    "businesses.healthcare": "Բժշկական",
    "businesses.empty.title": "Բիզնես չի գտնվել",
    "businesses.empty.text": "",
    "business.card.book": "Ամրագրել",
    "business.card.view": "Տեսնել էջը",
    "stats.businesses": "Գործընկերներ",
    "stats.services": "Ծառայություններ",
    "stats.staff": "Մասնագետներ",
    "stats.categories": "Կատեգորիաներ",
    "plans.badge": "Պլաններ",
    "plans.title": "Ընտրիր հարմար պլանը",
    "plans.text": "",
    "cta.badge": "Բիզնեսների համար",
    "cta.title": "Դարձրու քո բիզնեսը տեսանելի և ամրագրելի",
    "cta.text": "Կառավարիր ամրագրումները, հաճախորդներին, թիմը և վճարումները մեկ հարթակից։",
    "cta.pricing": "Տեսնել պլանները",
    "benefits.fast.title": "Արագ ամրագրում",
    "benefits.fast.text": "Հաճախորդը գտնում է ծառայությունը, տեսնում ազատ ժամերը և ամրագրում առանց զանգերի։",
    "benefits.secure.title": "Հստակ և ապահով",
    "benefits.secure.text": "Բիզնեսի էջը, մասնագետները, ծառայությունները և հասանելի ժամերը մեկ տեղում են։",
    "benefits.real.title": "Միշտ հասանելի",
    "benefits.real.text": "Գտիր ծառայությունները և ամրագրիր քեզ հարմար պահին։",
    "benefits.growth.title": "Բիզնեսների աճ",
    "benefits.growth.text": "Ավելացրու նոր ծառայություններ, վաճառքներ և հաճախորդների վերադարձը։",
    "status.loading": "Բեռնվում է...",
    "status.errorBusinesses": "Բիզնեսների ցուցակը ժամանակավորապես հասանելի չէ։",
    "status.errorPlans": "Չհաջողվեց բեռնել պլանները։",
  },
  ru: {
    "nav.home": "Главная",
    "nav.services": "Услуги",
    "nav.how": "Как работает",
    "nav.businesses": "Партнёры",
    "nav.map": "Карта",
    "nav.pricing": "Цены",
    "nav.about": "О нас",
    "nav.contact": "Контакты",
    "nav.login": "Войти",
    "nav.start": "Начать бесплатно",
    "hero.badge": "#1 Платформа онлайн-бронирования в Армении",
    "hero.title1": "Бронируйте услуги",
    "hero.title2": "быстро и удобно",
    "hero.subtitle": "Vizit.am помогает находить услуги и медицинские визиты, смотреть реальные бизнесы и быстро бронировать свободное время.",
    "search.label": "Какую услугу ищете?",
    "search.placeholder": "Например: pro, салон, стоматолог",
    "search.location": "Место",
    "search.city": "Ереван",
    "search.button": "Найти",
    "popular": "Популярные запросы:",
    "categories.title": "Выберите категорию",
    "categories.all": "Все категории",
    "categories.empty.title": "Категорий пока нет",
    "categories.empty.text": "Скоро здесь появятся доступные категории.",
    "how.title": "Почему выбирают Vizit.am",
    "businesses.badge": "Зарегистрированные бизнесы",
    "businesses.title": "Выберите бизнес и забронируйте время",
    "businesses.text": "Найдите подходящий бизнес и забронируйте свободное время.",
    "businesses.all": "Все",
    "businesses.services": "Услуги",
    "businesses.healthcare": "Медицина",
    "businesses.empty.title": "Бизнес не найден",
    "businesses.empty.text": "",
    "business.card.book": "Забронировать",
    "business.card.view": "Открыть",
    "stats.businesses": "Партнёры",
    "stats.services": "Услуги",
    "stats.staff": "Специалисты",
    "stats.categories": "Категории",
    "plans.badge": "Планы",
    "plans.title": "Выберите подходящий тариф",
    "plans.text": "",
    "cta.badge": "Для бизнеса",
    "cta.title": "Сделайте бизнес видимым и доступным для бронирования",
    "cta.text": "Управляйте записями, клиентами, командой и платежами в одном месте.",
    "cta.pricing": "Посмотреть тарифы",
    "benefits.fast.title": "Быстрое бронирование",
    "benefits.fast.text": "Клиент находит услугу, видит свободное время и бронирует без звонков.",
    "benefits.secure.title": "Понятно и надёжно",
    "benefits.secure.text": "Публичная страница бизнеса, специалисты, услуги и доступное время собраны в одном месте.",
    "benefits.real.title": "Всегда доступно",
    "benefits.real.text": "Находите услуги и бронируйте удобное время.",
    "benefits.growth.title": "Рост бизнеса",
    "benefits.growth.text": "Развивайте услуги, продажи и возвращаемость клиентов.",
    "status.loading": "Загрузка...",
    "status.errorBusinesses": "Список бизнесов временно недоступен.",
    "status.errorPlans": "Не удалось загрузить планы.",
  },
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.how": "How it works",
    "nav.businesses": "Partners",
    "nav.map": "Map",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.start": "Start free",
    "hero.badge": "#1 Online booking platform in Armenia",
    "hero.title1": "Book services",
    "hero.title2": "fast and easy",
    "hero.subtitle": "Vizit.am helps people find services and medical visits, browse real businesses and book available times quickly.",
    "search.label": "What service are you looking for?",
    "search.placeholder": "Example: pro, salon, dentist",
    "search.location": "Location",
    "search.city": "Yerevan",
    "search.button": "Search",
    "popular": "Popular searches:",
    "categories.title": "Explore services",
    "categories.all": "All categories",
    "categories.empty.title": "No categories yet",
    "categories.empty.text": "Available categories will appear here soon.",
    "how.title": "Why choose Vizit.am",
    "businesses.badge": "Registered businesses",
    "businesses.title": "Choose a business and book a time",
    "businesses.text": "Find the right business and book an available time.",
    "businesses.all": "All",
    "businesses.services": "Services",
    "businesses.healthcare": "Healthcare",
    "businesses.empty.title": "No businesses found",
    "businesses.empty.text": "",
    "business.card.book": "Book",
    "business.card.view": "View page",
    "stats.businesses": "Partners",
    "stats.services": "Services",
    "stats.staff": "Specialists",
    "stats.categories": "Categories",
    "plans.badge": "Plans",
    "plans.title": "Choose the right plan",
    "plans.text": "",
    "cta.badge": "For businesses",
    "cta.title": "Make your business visible and bookable",
    "cta.text": "Manage bookings, customers, your team and payments from one platform.",
    "cta.pricing": "View pricing",
    "benefits.fast.title": "Fast booking",
    "benefits.fast.text": "Customers find a service, see available times and book without calls.",
    "benefits.secure.title": "Clear and reliable",
    "benefits.secure.text": "Business details, specialists, services and available times in one place.",
    "benefits.real.title": "Always available",
    "benefits.real.text": "Find services and book at a convenient time.",
    "benefits.growth.title": "Business growth",
    "benefits.growth.text": "Grow your services, sales and customer loyalty.",
    "status.loading": "Loading...",
    "status.errorBusinesses": "The business list is temporarily unavailable.",
    "status.errorPlans": "Could not load plans.",
  },
};

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "hy";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "hy" || stored === "ru" || stored === "en" ? stored : "hy";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key: string) => dictionaries[locale][key] ?? dictionaries.hy[key] ?? key,
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
