import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, BriefcaseBusiness, CalendarCheck2, MessageCircleMore, Users2 } from "lucide-react";
import { Link } from "react-router-dom";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { fadeUp, pageTransition, staggerContainer } from "../lib/motion";

import tasksImg from "../assets/feature-tasks.png";
import analyticsImg from "../assets/feature-analytics.png";
import staffImg from "../assets/feature-staff.png";
import clientsImg from "../assets/feature-clients.png";
import bookingImg from "../assets/feature-booking.png";
import { useLanguage, type Locale } from "../contexts/LanguageContext";

type FeatureSection = {
  title: string;
  image: string;
  icon: ComponentType<{ className?: string }>;
  bullets: string[];
  reverse?: boolean;
};

const sections: FeatureSection[] = [
  {
    title: "Ամրագրումների վահանակ",
    image: tasksImg,
    icon: BriefcaseBusiness,
    bullets: [
      "Ամրագրումների արագ վահանակ՝ սպասող, հաստատված, ավարտված, չեկած և չեղարկված սյունակներով։",
      "Թափանցիկ վերահսկում՝ որ ամրագրումն ինչ վիճակում է և ով է սպասարկում այն։",
      "Արագ աշխատանքային հոսք՝ օրացույցի ու ամրագրումների կառավարման հետ միասին։",
      "Քարտերը կապվում են հաճախորդի, ծառայության և մասնագետի հետ։",
    ],
  },
  {
    title: "Ֆինանսներ և անալիտիկա",
    image: analyticsImg,
    icon: BarChart3,
    bullets: [
      "Եկամուտ, ամրագրումներ, հաճախորդների հոսք և թիմի արդյունավետություն՝ մեկ dashboard-ում։",
      "Աղբյուրների վերլուծություն՝ կայք, Instagram, Facebook, WhatsApp, ադմին և գործընկեր ալիքներով։",
      "Ծառայությունների և աշխատակիցների արդյունավետության խորացված կտրվածքներ։",
      "Ժամային զբաղվածություն, վերաամրագրումներ, no-show և conversion դիտարկումներ։",
    ],
    reverse: true,
  },
  {
    title: "Պերսոնալ",
    image: staffImg,
    icon: Users2,
    bullets: [
      "Աշխատաժամանակի արագ պլանավորում ընդհանուր schedule grid-ով։",
      "Յուրաքանչյուր աշխատակցի համար անհատական գներ, տևողություններ և հասանելիություն։",
      "Role-based visibility՝ staff-ը տեսնում է իրենը, owner/manager-ը՝ ամբողջ թիմը։",
      "Աշխատակիցների բեռնվածության, booking volume-ի և revenue-ի համեմատական վերլուծություն։",
    ],
  },
  {
    title: "Հաճախորդների բազա",
    image: clientsImg,
    icon: CalendarCheck2,
    bullets: [
      "Լիարժեք client card՝ պատմություն, ծախսված գումար, այցերի քանակ և հաջորդ այց։",
      "Search, filters և segment-ներ՝ նոր, վերադարձող, inactive, VIP և custom խմբերով։",
      "Source tracking-ը պահպանում է, թե հաճախորդը որտեղից է եկել առաջին ու վերջին անգամ։",
      "Booking history, notes, discounts, bonuses և repeat booking flow։",
    ],
    reverse: true,
  },
  {
    title: "Օնլայն ամրագրում ձեր կայքում և սոցցանցերում",
    image: bookingImg,
    icon: MessageCircleMore,
    bullets: [
      "Booking widget՝ website-ի, Instagram-ի, Facebook-ի և WhatsApp-ի համար։",
      "Արագ ամրագրում՝ ցանկացած աշխատակցով կամ կոնկրետ մասնագետով։",
      "Հաճախորդի cabinet՝ իր ամրագրումների պատմությամբ, կրկնությամբ և չեղարկումով։",
      "Սոցիալական կոճակները միաժամանակ աշխատում են որպես կապի ալիք և ամրագրման աղբյուրների հետևում։",
    ],
  },
];

const translatedSections: Record<Locale, Array<{ title: string; bullets: string[] }>> = {
  hy: sections.map(({ title, bullets }) => ({ title, bullets })),
  ru: [
    { title: "Панель записей", bullets: ["Быстрая доска со статусами ожидает, подтверждена, завершена, неявка и отменена.", "Понятный контроль статуса записи и ответственного специалиста.", "Единый рабочий процесс вместе с календарём и управлением записями.", "Каждая карточка связана с клиентом, услугой и специалистом."] },
    { title: "Финансы и аналитика", bullets: ["Доход, записи, поток клиентов и эффективность команды в одном разделе.", "Анализ источников: сайт, Instagram, Facebook, WhatsApp, администратор и партнёры.", "Подробные показатели по услугам и сотрудникам.", "Загрузка по времени, повторные записи, неявки и конверсия."] },
    { title: "Команда", bullets: ["Быстрое планирование рабочего времени в общей сетке расписания.", "Индивидуальные цены, длительность услуг и доступность каждого сотрудника.", "Разделение доступа: сотрудник видит свои данные, владелец и менеджер — всю команду.", "Сравнение загрузки, количества записей и выручки сотрудников."] },
    { title: "Клиентская база", bullets: ["Полная карточка клиента с историей, расходами, количеством и датой следующего визита.", "Поиск, фильтры и сегменты для новых, постоянных, неактивных и VIP-клиентов.", "Отслеживание первого и последнего источника клиента.", "История записей, заметки, скидки, бонусы и повторная запись."] },
    { title: "Онлайн-запись на сайте и в соцсетях", bullets: ["Виджет записи для сайта, Instagram, Facebook и WhatsApp.", "Запись к любому доступному или выбранному специалисту.", "Кабинет клиента с историей, повторением и отменой записей.", "Социальные кнопки одновременно работают как каналы связи и источники записи."] },
  ],
  en: [
    { title: "Booking board", bullets: ["A fast board for pending, confirmed, completed, no-show and cancelled bookings.", "Clear visibility into every booking's status and assigned provider.", "A unified workflow alongside the calendar and booking management.", "Each card connects the customer, service and provider."] },
    { title: "Finance and analytics", bullets: ["Revenue, bookings, client flow and team performance in one dashboard.", "Source analysis across website, Instagram, Facebook, WhatsApp, admin and partner channels.", "Detailed performance views for services and staff.", "Time utilization, rebooking, no-show and conversion insights."] },
    { title: "Staff", bullets: ["Fast work-hour planning in a shared schedule grid.", "Individual prices, service durations and availability for every team member.", "Role-based visibility: staff see their own schedule while owners and managers see the full team.", "Compare utilization, booking volume and revenue across staff."] },
    { title: "Client database", bullets: ["A complete client card with history, spending, visit count and next appointment.", "Search, filters and segments for new, returning, inactive and VIP clients.", "Track each client's first and latest acquisition source.", "Booking history, notes, discounts, rewards and repeat booking."] },
    { title: "Online booking on your website and social channels", bullets: ["A booking widget for websites, Instagram, Facebook and WhatsApp.", "Book with any available provider or a specific specialist.", "A client cabinet with booking history, repeat booking and cancellation.", "Social buttons work as both contact channels and booking-source tracking."] },
  ],
};

const pageCopy = {
  hy: { badge: "Vizit մոդուլներ", title: "Ամենակարևոր մոդուլները՝ մեկ միասնական հարթակում", intro: "Օրացույցը, առաջադրանքները, վերլուծությունը, հաճախորդները, թիմը և օնլայն ամրագրումը՝ մեկ միջավայրում։", module: "Մոդուլ", ctaTitle: "Սկսեք պլանի ընտրությունից կամ 14-օրյա փորձաշրջանից", ctaText: "Հիմնական գործիքները ներառված են վճարովի պլաններում, իսկ սահմանաչափերը կախված են ակտիվ մասնագետների, ծառայությունների և հասցեների քանակից։", pricing: "Տեսնել գները", trial: "Սկսել փորձաշրջանը" },
  ru: { badge: "Модули Vizit", title: "Главные инструменты на одной платформе", intro: "Календарь, задачи, аналитика, клиенты, команда и онлайн-запись в единой рабочей среде.", module: "Модуль", ctaTitle: "Выберите тариф или начните 14-дневный пробный период", ctaText: "Основные инструменты включены в платные тарифы, а лимиты зависят от числа активных специалистов, услуг и адресов.", pricing: "Посмотреть тарифы", trial: "Начать пробный период" },
  en: { badge: "Vizit modules", title: "Essential tools on one unified platform", intro: "Calendar, tasks, analytics, clients, staff and online booking in one workspace.", module: "Module", ctaTitle: "Choose a plan or start a 14-day trial", ctaText: "Core tools are included in paid plans; limits depend on active staff, services and locations.", pricing: "View pricing", trial: "Start a trial" },
};

function Bullet({ text, index }: { text: string; index: number }) {
  const palette = ["bg-rose-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500"];
  return (
    <div className="flex items-start gap-4">
      <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${palette[index % palette.length]}`} />
      <p className="text-lg leading-9 text-slate-800">{text}</p>
    </div>
  );
}

export default function Features() {
  const { locale } = useLanguage();
  const text = pageCopy[locale];
  const localizedSections = sections.map((section, index) => ({ ...section, ...translatedSections[locale][index] }));
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_18%,#faf7ff_100%)]">
      <LandingNavbar />
      <main className="pt-32 sm:pt-36 lg:pt-40">
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="show" className="mx-auto max-w-7xl text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
              <BarChart3 className="h-4 w-4" /> {text.badge}
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {text.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {text.intro}
            </motion.p>
          </motion.div>
        </section>

        <section className="space-y-10 px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-10">
            {localizedSections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.article
                  key={section.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="rounded-[40px] border border-white/70 bg-white/92 p-5 shadow-[0_20px_90px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8"
                >
                  <div className={`grid gap-8 2xl:grid-cols-2 2xl:items-center ${section.reverse ? "2xl:[&>*:first-child]:order-2 2xl:[&>*:last-child]:order-1" : ""}`}>
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                        <Icon className="h-4 w-4 text-violet-600" /> {text.module}
                      </div>
                      <h2 className="mt-5 text-[1.9rem] font-semibold tracking-tight text-slate-950 sm:text-4xl">{section.title}</h2>
                      <div className="mt-8 space-y-6">
                        {section.bullets.map((bullet, index) => <Bullet key={bullet} text={bullet} index={index} />)}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#f8f8fb] p-3 shadow-inner">
                      <img src={section.image} alt={section.title} className="w-full rounded-[24px] object-cover" />
                    </div>
                  </div>
                </motion.article>
              );
            })}

            <motion.div variants={fadeUp} className="rounded-[36px] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{text.ctaTitle}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-white/70">
                    {text.ctaText}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/pricing" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
                    {text.pricing} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/business/register" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                    {text.trial}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}
