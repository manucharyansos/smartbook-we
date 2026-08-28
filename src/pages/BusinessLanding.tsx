import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  HeartPulse,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users2,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import LandingNavbar from "../components/LandingNavbar";
import { useLanguage } from "../contexts/LanguageContext";
import { fadeUp, pageTransition, staggerContainer } from "../lib/motion";

const copy = {
  hy: {
    badge: "Vizit բիզնեսների համար",
    titleLead: "Ամրագրումները, թիմը և հաճախորդները՝",
    titleAccent: "մեկ համակարգում",
    intro: "Vizit-ը ծառայությունների և բժշկական բիզնեսների աշխատանքային հարթակն է՝ հանրային ամրագրումից մինչև օրացույց, թիմ և հաճախորդների պատմություն։",
    primary: "Սկսել 14 օր անվճար",
    secondary: "Տեսնել պլանները",
    proofs: ["Առանց քարտի", "Հայերեն · Русский · English", "Հեռախոսից և համակարգչից"],
    preview: "Օրինակային աշխատանքային վահանակ",
    today: "Այսօրվա ամրագրումներ",
    schedule: [["10:00", "Խորհրդատվություն", "Անի"], ["11:30", "Ծառայություն", "Մարի"], ["14:00", "Վերահսկիչ այց", "Դավիթ"]],
    confirmed: "Հաստատված",
    solutionsBadge: "Երկու մասնագիտացված ուղղություն",
    solutionsTitle: "Նույն ամուր հիմքը՝ տարբեր աշխատանքային տրամաբանությամբ",
    solutionsText: "Ընտրեք ձեր ոլորտը գրանցման ժամանակ․ հետագայում կարող եք ավելացնել համապատասխան կատեգորիան, ծառայություններն ու մասնագետներին։",
    solutions: [
      { title: "Ծառայությունների բիզնես", text: "Սրահներ, վարպետներ, ավտոսերվիս, դասընթացներ, խորհրդատվություն և այլ ժամադրություններով աշխատող ծառայություններ։", points: ["Ծառայություններ և հավելումներ", "Թիմի գրաֆիկ և հասանելիություն", "Հանրային էջ և քարտեզ"] },
      { title: "Բժշկական ուղղություն", text: "Կլինիկաներ, ատամնաբուժարաններ, մասնավոր բժիշկներ, ախտորոշում և վերականգնում։", points: ["Մասնագետներ և աշխատասենյակներ", "Այցերի ու հաճախորդների պատմություն", "Բժշկական workflow-ի առանձին միջավայր"] },
    ],
    featuresBadge: "Հիմնական հնարավորություններ",
    featuresTitle: "Այն ամենը, ինչ պետք է ամենօրյա աշխատանքի համար",
    featuresText: "Սկսեք հիմնական հոսքերից և ավելացրեք գործիքները բիզնեսի աճին զուգահեռ։",
    features: [
      ["Օնլայն ամրագրում", "Սեփական հանրային էջ, ծառայությունների ու մասնագետների ընտրություն և հասանելի ժամեր։"],
      ["Օրացույց և թիմ", "Աշխատաժամեր, ընդմիջումներ, փակ օրեր, դերեր և մասնագետների անհատական հասանելիություն։"],
      ["Հաճախորդների բազա", "Այցերի պատմություն, նշումներ, խմբեր, կրկնվող ամրագրումներ և client cabinet։"],
      ["Քարտեզ և marketplace", "Բիզնեսի հասցեներ, կատեգորիաներ, որոնում և Yandex քարտեզի նշիչներ։"],
      ["Վերլուծություն", "Ամրագրումներ, եկամուտ, աղբյուրներ, թիմի ծանրաբեռնվածություն և no-show դիտարկումներ։"],
      ["Վճարումների պատրաստ հոսք", "Նախավճարների ու վճարումների կառավարում՝ production provider-ը միացնելուց հետո։"],
    ],
    workflowBadge: "Պարզ մեկնարկ",
    workflowTitle: "Երեք քայլ մինչև առաջին ամրագրումը",
    workflow: [
      ["Ստեղծեք հաշիվը", "Ընտրեք ուղղությունն ու պլանը և սկսեք 14-օրյա փորձաշրջանը։"],
      ["Կարգավորեք բիզնեսը", "Ավելացրեք ծառայությունները, մասնագետներին, հասցեն և աշխատանքային ժամերը։"],
      ["Կիսվեք հղումով", "Հրապարակեք էջը marketplace-ում կամ տեղադրեք ամրագրման հղումը սոցցանցերում։"],
    ],
    channelsBadge: "Թափանցիկ կապի ալիքներ",
    channelsTitle: "Միայն այն խոստումները, որոնք իսկապես աշխատում են",
    channelsText: "Vizit-ը հստակ բաժանում է գործող ալիքներն ու provider-ի միացում պահանջող հնարավորությունները։",
    active: "Գործող",
    activeItems: ["Էլ. փոստով հաստատումներ", "Telegram ծանուցումներ բիզնեսին", "Հանրային ամրագրման կառավարում"],
    configured: "Provider-ի միացումից հետո",
    configuredItems: ["SMS և WhatsApp հաղորդագրություններ", "Իրական վճարային gateway", "Լրացուցիչ ավտոմատացումներ"],
    finalBadge: "Պատրա՞ստ եք սկսել",
    finalTitle: "Ձեր բիզնեսի հաջորդ ամրագրումը կարող է գալ Vizit-ից",
    finalText: "Ստեղծեք հաշիվը, կարգավորեք աշխատանքային էջը և փորձեք ամբողջ հոսքը մինչև հրապարակելը։",
  },
  ru: {
    badge: "Vizit для бизнеса", titleLead: "Записи, команда и клиенты —", titleAccent: "в одной системе", intro: "Vizit — рабочая платформа для сервисного и медицинского бизнеса: от публичной онлайн-записи до календаря, команды и истории клиентов.", primary: "Начать 14 дней бесплатно", secondary: "Посмотреть тарифы", proofs: ["Без банковской карты", "Հայերեն · Русский · English", "На телефоне и компьютере"], preview: "Пример рабочего кабинета", today: "Записи на сегодня", schedule: [["10:00", "Консультация", "Анна"], ["11:30", "Услуга", "Мария"], ["14:00", "Повторный визит", "Давид"]], confirmed: "Подтверждено",
    solutionsBadge: "Два специализированных направления", solutionsTitle: "Единая надёжная основа с разной логикой работы", solutionsText: "Выберите направление при регистрации, затем добавьте подходящую категорию, услуги и специалистов.", solutions: [
      { title: "Сервисный бизнес", text: "Салоны, мастера, автосервис, обучение, консультации и другие услуги по записи.", points: ["Услуги и дополнения", "График и доступность команды", "Публичная страница и карта"] },
      { title: "Медицинское направление", text: "Клиники, стоматологии, частные врачи, диагностика и реабилитация.", points: ["Специалисты и кабинеты", "История визитов и клиентов", "Отдельная медицинская рабочая среда"] },
    ],
    featuresBadge: "Основные возможности", featuresTitle: "Всё необходимое для ежедневной работы", featuresText: "Начните с главных процессов и добавляйте инструменты по мере роста бизнеса.", features: [
      ["Онлайн-запись", "Публичная страница, выбор услуг и специалистов и доступное время."], ["Календарь и команда", "Рабочие часы, перерывы, выходные, роли и личная доступность специалистов."], ["База клиентов", "История визитов, заметки, группы, повторная запись и кабинет клиента."], ["Карта и marketplace", "Адреса, категории, поиск и точки бизнеса на карте Yandex."], ["Аналитика", "Записи, доход, источники, загрузка команды и показатели неявок."], ["Готовый платёжный поток", "Управление предоплатой и платежами после подключения production-провайдера."],
    ],
    workflowBadge: "Простой запуск", workflowTitle: "Три шага до первой записи", workflow: [["Создайте аккаунт", "Выберите направление и тариф и начните 14-дневный пробный период."], ["Настройте бизнес", "Добавьте услуги, специалистов, адрес и рабочее время."], ["Поделитесь ссылкой", "Опубликуйте страницу в marketplace или добавьте ссылку в соцсети."]],
    channelsBadge: "Прозрачные каналы связи", channelsTitle: "Обещаем только то, что действительно работает", channelsText: "Vizit чётко разделяет действующие каналы и возможности, которым требуется подключение провайдера.", active: "Работает", activeItems: ["Подтверждения по электронной почте", "Telegram-уведомления бизнесу", "Управление публичной записью"], configured: "После подключения провайдера", configuredItems: ["SMS и WhatsApp", "Реальный платёжный шлюз", "Дополнительные автоматизации"], finalBadge: "Готовы начать?", finalTitle: "Следующая запись вашего бизнеса может прийти через Vizit", finalText: "Создайте аккаунт, настройте рабочую страницу и проверьте весь процесс перед публикацией.",
  },
  en: {
    badge: "Vizit for business", titleLead: "Bookings, staff and clients —", titleAccent: "in one system", intro: "Vizit is a workspace for service and healthcare businesses, from public online booking to calendars, staff and client history.", primary: "Start 14 days free", secondary: "View pricing", proofs: ["No payment card", "Հայերեն · Русский · English", "Mobile and desktop"], preview: "Sample business workspace", today: "Today's bookings", schedule: [["10:00", "Consultation", "Anna"], ["11:30", "Service", "Maria"], ["14:00", "Follow-up visit", "David"]], confirmed: "Confirmed",
    solutionsBadge: "Two specialized verticals", solutionsTitle: "One reliable foundation with purpose-built workflows", solutionsText: "Choose your vertical during registration, then add the right category, services and specialists.", solutions: [
      { title: "Service businesses", text: "Salons, independent professionals, auto services, courses, consulting and other appointment-based services.", points: ["Services and add-ons", "Staff schedules and availability", "Public page and map"] },
      { title: "Healthcare", text: "Clinics, dental practices, private doctors, diagnostics and rehabilitation.", points: ["Providers and rooms", "Visit and client history", "A dedicated healthcare workspace"] },
    ],
    featuresBadge: "Core capabilities", featuresTitle: "Everything needed for daily operations", featuresText: "Start with the core flows and add tools as your business grows.", features: [
      ["Online booking", "A public page with services, specialists and available times."], ["Calendar and staff", "Working hours, breaks, closed days, roles and individual availability."], ["Client database", "Visit history, notes, groups, repeat bookings and a client cabinet."], ["Map and marketplace", "Locations, categories, search and Yandex map markers."], ["Analytics", "Bookings, revenue, sources, staff utilization and no-show visibility."], ["Payment-ready flow", "Deposit and payment management after a production provider is connected."],
    ],
    workflowBadge: "Simple launch", workflowTitle: "Three steps to the first booking", workflow: [["Create your account", "Choose a vertical and plan and begin the 14-day trial."], ["Set up the business", "Add services, staff, a location and working hours."], ["Share the link", "Publish in the marketplace or add the booking link to social channels."]],
    channelsBadge: "Transparent communication channels", channelsTitle: "Only promises that work in practice", channelsText: "Vizit clearly separates active channels from capabilities that require a provider connection.", active: "Active", activeItems: ["Email confirmations", "Telegram alerts for businesses", "Public booking management"], configured: "After provider setup", configuredItems: ["SMS and WhatsApp", "Live payment gateway", "Additional automations"], finalBadge: "Ready to begin?", finalTitle: "Your next appointment can come through Vizit", finalText: "Create an account, set up the workspace and test the full flow before publishing.",
  },
} as const;

const featureIcons = [CalendarDays, Users2, LayoutDashboard, MapPinned, BarChart3, WalletCards];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-[#1e9e92]/25 bg-[#1e9e92]/[0.08] px-4 py-2 text-xs font-semibold text-[#167d74] dark:border-[#58d0c4]/25 dark:bg-[#58d0c4]/10 dark:text-[#8be3da] sm:text-sm"><Sparkles className="h-4 w-4" />{children}</div>;
}

export default function BusinessLanding() {
  const { locale } = useLanguage();
  const text = copy[locale];

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="vizit-public-page vizit-business-page min-h-screen overflow-x-clip bg-[#fbf8f4] text-[#2b0d35] transition-colors dark:bg-[#0d0810] dark:text-white">
      <LandingNavbar audience="business" />

      <main>
        <section id="vizit-business-hero" className="vizit-business-hero relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8 lg:pb-28">
          <span aria-hidden="true" className="pointer-events-none absolute -left-40 top-12 h-96 w-96 rounded-full bg-[#e8c77f]/20 blur-3xl dark:bg-[#e8c77f]/8" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-32 top-20 h-[430px] w-[430px] rounded-full bg-[#8d4b82]/16 blur-3xl dark:bg-[#8d4b82]/12" />
          <motion.div variants={staggerContainer(0.08, 0.04)} initial="hidden" animate="show" className="relative mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="text-center lg:text-left">
              <motion.div variants={fadeUp}><Eyebrow>{text.badge}</Eyebrow></motion.div>
              <motion.h1 variants={fadeUp} className="vizit-display mt-6 text-[2.45rem] font-bold leading-[1.06] tracking-[-0.045em] text-[#2b0d35] dark:text-white sm:text-6xl lg:text-[4.4rem]">
                {text.titleLead} <span className="bg-gradient-to-r from-[#6d2a63] to-[#c88e37] bg-clip-text text-transparent dark:from-[#f0c8e8] dark:to-[#f4d99f]">{text.titleAccent}</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#756777] dark:text-white/65 sm:text-lg lg:mx-0">{text.intro}</motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/register" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2b0d35] to-[#6d2a63] px-7 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(75,22,75,0.22)] transition hover:-translate-y-0.5 hover:brightness-110">{text.primary}<ArrowRight className="h-4 w-4" /></Link>
                <Link to="/pricing" className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-[#d39a43]/30 bg-white/85 px-7 py-3.5 text-sm font-bold text-[#4c394f] shadow-sm transition hover:bg-white dark:border-white/15 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.11]">{text.secondary}</Link>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
                {text.proofs.map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/20 bg-white/70 px-3 py-2 text-xs font-semibold text-[#6f5d6d] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60"><Check className="h-3.5 w-3.5 text-[#1e9e92]" />{item}</span>)}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-[620px]">
              <div className="absolute -inset-5 rounded-[42px] bg-gradient-to-br from-[#e8c77f]/25 via-transparent to-[#6d2a63]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/90 p-3 shadow-[0_35px_100px_rgba(75,36,52,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#18101b]/92 dark:shadow-black/45 sm:p-5">
                <div className="flex items-center justify-between px-2 pb-4 pt-1 sm:px-3">
                  <div><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a8795]">{text.preview}</div><div className="mt-1 text-lg font-bold text-[#2b0d35] dark:text-white">Vizit workspace</div></div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2b0d35] text-[#f4d99f]"><LayoutDashboard className="h-5 w-5" /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                  <div className="hidden rounded-[24px] bg-[#2b0d35] p-3 text-white sm:block">
                    {[LayoutDashboard, CalendarDays, Users2, BarChart3].map((Icon, index) => <div key={index} className={`mb-2 flex items-center gap-2 rounded-2xl px-3 py-3 text-xs ${index === 1 ? "bg-white/12 text-white" : "text-white/55"}`}><Icon className="h-4 w-4" /><span className="h-2 w-16 rounded-full bg-current opacity-70" /></div>)}
                  </div>
                  <div className="rounded-[24px] border border-[#eee3d7] bg-[#fffaf5] p-4 dark:border-white/8 dark:bg-white/[0.04] sm:p-5">
                    <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-[#9a8795]">{text.today}</div><div className="mt-1 text-2xl font-bold text-[#2b0d35] dark:text-white">3</div></div><div className="rounded-2xl bg-[#1e9e92]/10 p-3 text-[#167d74]"><CalendarDays className="h-5 w-5" /></div></div>
                    <div className="mt-5 space-y-2.5">
                      {text.schedule.map(([time, service, staff]) => <div key={`${time}-${service}`} className="grid grid-cols-[52px_1fr] gap-3 rounded-2xl border border-[#eadfd4] bg-white px-3 py-3 dark:border-white/8 dark:bg-white/[0.05]"><div className="flex items-center gap-1 text-xs font-bold text-[#6d2a63] dark:text-[#f0c8e8]"><Clock3 className="h-3.5 w-3.5" />{time}</div><div className="min-w-0"><div className="truncate text-sm font-bold text-[#3d243c] dark:text-white">{service}</div><div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#8b7a86] dark:text-white/50"><span>{staff}</span><span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-200">{text.confirmed}</span></div></div></div>)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="solutions" className="scroll-mt-24 border-y border-[#d39a43]/15 bg-white px-4 py-20 dark:border-white/8 dark:bg-[#120b14] sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto max-w-3xl text-center"><Eyebrow>{text.solutionsBadge}</Eyebrow><h2 className="vizit-display mt-5 text-3xl font-bold tracking-[-0.035em] text-[#2b0d35] dark:text-white sm:text-5xl">{text.solutionsTitle}</h2><p className="mt-5 text-base leading-8 text-[#756777] dark:text-white/60">{text.solutionsText}</p></div>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {text.solutions.map((solution, index) => { const Icon = index === 0 ? Sparkles : Stethoscope; return <motion.article key={solution.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="relative overflow-hidden rounded-[32px] border border-[#e8d9ca] bg-[#fffaf5] p-6 shadow-[0_20px_70px_rgba(75,36,52,0.08)] dark:border-white/10 dark:bg-white/[0.05] sm:p-8"><div className={`grid h-14 w-14 place-items-center rounded-2xl ${index === 0 ? "bg-[#6d2a63] text-white" : "bg-[#1e9e92] text-white"}`}><Icon className="h-6 w-6" /></div><h3 className="mt-6 text-2xl font-bold text-[#2b0d35] dark:text-white">{solution.title}</h3><p className="mt-3 text-sm leading-7 text-[#756777] dark:text-white/60">{solution.text}</p><div className="mt-6 space-y-3">{solution.points.map((point) => <div key={point} className="flex items-center gap-3 text-sm font-semibold text-[#584855] dark:text-white/75"><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#1e9e92] shadow-sm dark:bg-white/10"><Check className="h-3.5 w-3.5" /></span>{point}</div>)}</div></motion.article>; })}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px]"><div className="mx-auto max-w-3xl text-center"><Eyebrow>{text.featuresBadge}</Eyebrow><h2 className="vizit-display mt-5 text-3xl font-bold tracking-[-0.035em] text-[#2b0d35] dark:text-white sm:text-5xl">{text.featuresTitle}</h2><p className="mt-5 text-base leading-8 text-[#756777] dark:text-white/60">{text.featuresText}</p></div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{text.features.map(([title, description], index) => { const Icon = featureIcons[index]; return <motion.article key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="rounded-[28px] border border-[#e8d9ca] bg-white/80 p-6 shadow-[0_16px_55px_rgba(75,36,52,0.06)] dark:border-white/10 dark:bg-white/[0.05]"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4e8d7] text-[#6d2a63] dark:bg-white/10 dark:text-[#f4d99f]"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-lg font-bold text-[#2b0d35] dark:text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-[#756777] dark:text-white/58">{description}</p></motion.article>; })}</div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 bg-[#2b0d35] px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1120px]"><div className="text-center"><div className="inline-flex items-center gap-2 rounded-full border border-[#f4d99f]/25 bg-[#f4d99f]/10 px-4 py-2 text-sm font-semibold text-[#f4d99f]"><BadgeCheck className="h-4 w-4" />{text.workflowBadge}</div><h2 className="vizit-display mt-5 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{text.workflowTitle}</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{text.workflow.map(([title, description], index) => <motion.article key={title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="vizit-business-workflow-card rounded-[28px] border border-white/12 p-6"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4d99f] text-lg font-black text-[#2b0d35]">{index + 1}</div><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/62">{description}</p></motion.article>)}</div></div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} className="mx-auto max-w-[1120px] overflow-hidden rounded-[36px] border border-[#d39a43]/22 bg-white p-6 shadow-[0_30px_100px_rgba(75,36,52,0.10)] dark:border-white/10 dark:bg-white/[0.05] sm:p-9 lg:p-12">
            <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><Eyebrow>{text.channelsBadge}</Eyebrow><h2 className="vizit-display mt-5 text-3xl font-bold tracking-[-0.035em] text-[#2b0d35] dark:text-white sm:text-4xl">{text.channelsTitle}</h2><p className="mt-4 text-sm leading-7 text-[#756777] dark:text-white/60">{text.channelsText}</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-[26px] border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-400/15 dark:bg-emerald-400/[0.07]"><div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200"><BellRing className="h-5 w-5" />{text.active}</div><div className="mt-4 space-y-3">{text.activeItems.map((item) => <div key={item} className="flex gap-2 text-sm leading-6 text-emerald-900/75 dark:text-emerald-100/70"><Check className="mt-1 h-4 w-4 shrink-0" />{item}</div>)}</div></div><div className="rounded-[26px] border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-400/15 dark:bg-amber-400/[0.07]"><div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200"><ShieldCheck className="h-5 w-5" />{text.configured}</div><div className="mt-4 space-y-3">{text.configuredItems.map((item) => <div key={item} className="flex gap-2 text-sm leading-6 text-amber-900/70 dark:text-amber-100/65"><Globe2 className="mt-1 h-4 w-4 shrink-0" />{item}</div>)}</div></div></div></div>
          </motion.div>
        </section>

        <section id="vizit-business-final" className="vizit-business-final px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"><div className="vizit-business-final-card mx-auto max-w-[1120px] overflow-hidden rounded-[38px] bg-[radial-gradient(circle_at_85%_0%,rgba(244,217,159,0.28),transparent_34%),linear-gradient(135deg,#2b0d35_0%,#6d2a63_100%)] px-6 py-10 text-center text-white shadow-[0_32px_100px_rgba(75,22,75,0.25)] sm:px-10 sm:py-14"><div className="vizit-business-final-badge inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#f4d99f]"><HeartPulse className="h-4 w-4" />{text.finalBadge}</div><h2 className="vizit-display mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-[-0.035em] sm:text-5xl">{text.finalTitle}</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{text.finalText}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/register" className="vizit-business-final-primary inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#fff8ef] px-7 py-3.5 text-sm font-bold text-[#2b0d35] transition hover:bg-white">{text.primary}<ArrowRight className="h-4 w-4" /></Link><Link to="/pricing" className="vizit-business-final-secondary inline-flex min-h-13 items-center justify-center rounded-2xl border border-white/18 px-7 py-3.5 text-sm font-bold text-white transition">{text.secondary}</Link></div></div></section>
      </main>

      <Footer />
    </motion.div>
  );
}
