import { rentalCopy } from "../i18n/rentals";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Crown,
  Handshake,
  Landmark,
  Loader2,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { fetchBillingMe } from "@/lib/billingMeApi";
import { createCheckoutSession, getInvoicePaymentStatus, type PaymentTransaction } from "@/lib/paymentsApi";
import { providerPaymentMethod, rememberPendingCheckout } from "@/lib/paymentReturn";
import type { PublicPlan } from "@/lib/planApi";
import { isCustomPlan, localizePlanNameForLocale } from "@/lib/planPresentation";
import { useLanguage, type Locale } from "@/contexts/LanguageContext";
import { LEGAL_ENTITY } from "@/config/legal";

type BillingCycle = "monthly" | "yearly";
type PaymentBrand = "idbank" | "idram";
type PaymentMethodValue = "idbank-card" | "idram-wallet";

const paymentMethodDefinitions: Array<{
  value: PaymentMethodValue;
  label: Record<Locale, string>;
  detail: Record<Locale, string>;
  brands: PaymentBrand[];
}> = [
  {
    value: "idram-wallet",
    label: { hy: "Idram դրամապանակ", ru: "Кошелёк Idram", en: "Idram wallet" },
    detail: { hy: "Վճարումը հաստատվում է Idram-ում", ru: "Оплата подтверждается в Idram", en: "Confirm your payment in Idram" },
    brands: ["idram"],
  },
  {
    value: "idbank-card",
    label: { hy: "Բանկային քարտ · IDBank V-POS", ru: "Банковская карта · IDBank V-POS", en: "Bank card · IDBank V-POS" },
    detail: { hy: "Կակտիվանա միայն պաշտոնական merchant կապից հետո", ru: "Активируется только после официального merchant-подключения", en: "Activates only after the official merchant connection" },
    brands: ["idbank"],
  },
];

const paymentBrandAssets: Partial<Record<PaymentBrand, { src: string; alt: string; imageClassName?: string; badgeClassName?: string }>> = {
  idram: { src: "/payments/idram.png", alt: "Idram", imageClassName: "max-h-[26px] max-w-[96px]" },
  idbank: {
    src: "https://idbank.am/images/m-logo.svg",
    alt: "IDBank",
    imageClassName: "max-h-[20px] max-w-[82px]",
  },
};

const billingCopy = {
  hy: {
    monthly: "Ամսական",
    yearly: "Տարեկան",
    loadingTitle: "Բեռնում ենք պլանը…",
    loadingSubtitle: "Ստուգում ենք բաժանորդագրությունն ու առաջարկները",
    loadErrorTitle: "Չհաջողվեց բեռնել պլանի տվյալները",
    loadErrorText: "Ստուգիր կապը և փորձիր կրկին։",
    retry: "Կրկնել",
    createInvoiceError: "Չհաջողվեց ստեղծել վճարման հաշիվը։ Փորձիր կրկին։",
    checkoutError: "Չհաջողվեց բացել վճարման էջը։ Փորձիր կրկին։",
    businessSuspended: "Բիզնեսը կասեցված է։ Վերականգնման համար կապվիր աջակցության հետ։",
    billingSuspended: "Վճարումները կասեցված են։ Ընտրիր գործող առաջարկը և հետևիր հասանելի ակտիվացման քայլերին, իսկ եթե օնլայն վճարումը փակ է՝ կապվիր աջակցության հետ։",
    subscriptionInactive: "Բաժանորդագրությունն ակտիվ չէ։ Ընտրիր պլանը և հետևիր հասանելի ակտիվացման քայլերին, իսկ եթե օնլայն վճարումը փակ է՝ կապվիր աջակցության հետ։",
    heroBadge: "Վճարումներ · ձեր բաժանորդագրությունը",
    title: "Պլան և վճարումներ",
    intro: "Ընտրիր պլանը ըստ ակտիվ մասնագետների, ծառայությունների և հասցեների քանակի։ Սեփականատիրոջ և մենեջերի հաշիվները սահմանաչափում չեն հաշվվում, իսկ անհատական առաջարկը կերևա հենց այստեղ։",
    generalSettings: "Ընդհանուր կարգավորումներ",
    currentPlan: "Ընթացիկ պլան",
    awaitingActivation: "Ակտիվացում է սպասվում",
    individualPlan: "Անհատական առաջարկ",
    status: "Կարգավիճակ",
    specialists: "Մասնագետներ",
    specialistHint: "Սեփականատերը և մենեջերը չեն հաշվվում",
    services: "Ծառայություններ",
    servicesHint: "Ընթացիկ ծառայությունների քանակ",
    locations: "Հասցեներ",
    locationsHint: "Մասնաճյուղերի և հասցեների սահմանաչափ",
    paymentProvider: "Վճարման ծառայություն",
    awaitingConnection: "Սպասում է միացման",
    secureEnvironment: "Պաշտոնական կապի կարգավիճակ",
    effectiveMonthly: "Արդյունավետ ամսական արժեք",
    customTermsActive: "Անհատական պայմաններն ակտիվ են",
    yearlyValue: "Տարեկան արժեքը՝",
    allToolsIncluded: "Բոլոր հիմնական գործիքները ներառված են բոլոր պլաններում",
    changePlan: "Փոխել պլանը",
    comparePlans: "Համեմատիր բոլոր իրական սահմանաչափերը։ Եթե սուպեր ադմինը ստեղծել է անհատական առաջարկ, այն կերևա որպես առանձին քարտ՝ իր գործող գնով և ժամկետով։",
    plansLoadError: "Չհաջողվեց բեռնել հասանելի պլանները։",
    plansLoading: "Բեռնում ենք հասանելի պլանները…",
    twoMonthsFree: "2 ամիս անվճար",
    active: "Ակտիվ",
    perMonthEffective: "Արդյունավետ՝",
    perMonth: "/ամիս",
    customYearly: "Անհատական տարեկան առաջարկ՝",
    savings: "Խնայողություն՝",
    oneLocation: "1 հասցե",
    unlimitedServices: "Ծառայությունների սահմանափակում չկա",
    featureBooking: "Հանրային ամրագրում և հաճախորդի էջ",
    featureAnalytics: "Ամրագրումների վահանակ, վերլուծություն և աղբյուրների հետևում",
    featureOwners: "Սեփականատեր և մենեջեր՝ անսահմանափակ",
    currentPlanButton: "Ընթացիկ պլան",
    restorePlan: "Վերականգնել այս պլանը",
    payTrialPlan: "Վճարել և ակտիվացնել",
    createCustomInvoice: "Ստեղծել հաշիվ ըստ անհատական առաջարկի",
    createYearlyInvoice: "Ստեղծել տարեկան վճարման հաշիվ",
    createMonthlyInvoice: "Ստեղծել ամսական վճարման հաշիվ",
    securePayment: "Վճարային կապի կարգավիճակ",
    choosePayment: "Վճարային կապի եղանակ",
    paymentIntro: "Վճարումն ավարտվում է ընտրված ծառայության պաշտպանված էջում։ Պլանն ակտիվանում է սերվերի հաստատումից հետո։",
    sellerLine: `Վճար ստացող՝ ${LEGAL_ENTITY.legalName} · ՀՎՀՀ ${LEGAL_ENTITY.taxId} · ${LEGAL_ENTITY.email}`,
    autoRenewalOff: "Ավտոմատ երկարաձգումը միացված չէ․ յուրաքանչյուր նոր շրջանի համար ստեղծվում և վճարվում է նոր հաշիվ։",
    selected: "Ընտրված է՝",
    paymentMethodsAria: "Վճարման եղանակներ",
    testEnvironment: "Թեստային միջավայր",
    connected: "Միացված",
    bankAwaiting: "Սպասում է բանկի միացմանը",
    paymentSafetyNote: "Միայն «Միացված» նշումով եղանակը կարող է ընդունել վճարում։ Մինչ այդ Vizit-ը քարտային տվյալներ չի հավաքում և այս էջից գումար չի գանձում։",
    latestInvoice: "Վերջին վճարման հաշիվը",
    invoicesLoading: "Բեռնում ենք վճարման հաշիվները…",
    invoicesLoadError: "Չհաջողվեց բեռնել վճարման հաշիվները։",
    noInvoiceTitle: "Վճարման հաշիվ դեռ չկա",
    noInvoiceText: "Ընտրիր պլանը և ստեղծիր հաշիվ։ Բանկի վճարման կոճակը կաշխատի միայն պաշտոնական կապից հետո։",
    invoice: "Հաշիվ",
    planFallback: "Պլան",
    customApplied: "Կիրառվել է անհատական առաջարկ",
    upcomingOffer: (plan: string, date: string) => `Ձեզ համար պատրաստված է անհատական առաջարկ (${plan})։ Այն կգործի ${date}-ից։`,
    upcomingOfferPrice: "Ամսական գին՝",
    discount: "Զեղչ՝",
    state: "Վիճակ",
    openBankPage: "Բացել բանկի վճարման էջը",
    checkoutText: "Պաշտոնական կապից հետո վճարումը կբացվի բանկի էջում, իսկ սերվերով հաստատված հաջող վճարումից հետո պլանը կակտիվանա։",
    providerUnavailable: "Վճարային ծառայությունը դեռ միացված չէ։ Կապվիր աջակցության հետ։",
    openIdramCheckout: "Վճարել Idram-ով",
    reviewPayment: "Վճարումը ստացվել է և պահանջում է ստուգում։ Կապվիր աջակցության հետ՝ առանց կրկին վճարելու։",
    openLiveCheckout: "Բացել IDBank վճարման էջը",
    openTestCheckout: "Բացել IDBank թեստային վճարման էջը",
    paymentApproved: "Վճարումը հաստատված է, և պլանն ակտիվացված է։",
    invoiceClosed: "Այս հաշիվն այլևս վճարման ենթակա չէ։ Ընտրիր պլանը և ստեղծիր նոր հաշիվ։",
    cancelInvoice: "Չեղարկել հաշիվը",
    cancelConfirm: "Չեղարկե՞լ այս վճարման հաշիվը։ Կարող ես հետո ընտրել պլան և ստեղծել նորը։",
    cancelError: "Չհաջողվեց չեղարկել հաշիվը։ Փորձիր կրկին։",
    payInvoiceTitle: (id: number) => `Վճարման հաշիվ #${id}`,
    choosePlanFirst: "Վճարելու համար նախ վերևում ընտրիր պլանը և սեղմիր «Ստեղծել հաշիվ»։",
    transactionTimeline: "Գործարքի ընթացք",
    reference: "Հղման համար",
    noTransactionTitle: "Գործարք դեռ չկա",
    noTransactionText: "Վճարման էջը բացելուց հետո այստեղ կերևան գործարքի հղման համարն ու վերջնական կարգավիճակը։",
    activeStaff: (count: number) => `Մինչև ${count} ակտիվ մասնագետ`,
    locationLimit: (count: number) => `Մինչև ${count} հասցե`,
    servicesLimit: (count: number) => `Մինչև ${count} ծառայություն`,
    remainingCycles: (count: number) => `Վավեր է ևս ${count} վճարային շրջան`,
  },
  ru: {
    monthly: "Ежемесячно",
    yearly: "Ежегодно",
    loadingTitle: "Загружаем тариф…",
    loadingSubtitle: "Проверяем подписку и доступные предложения",
    loadErrorTitle: "Не удалось загрузить данные тарифа",
    loadErrorText: "Проверьте соединение и попробуйте ещё раз.",
    retry: "Повторить",
    createInvoiceError: "Не удалось создать счёт. Попробуйте ещё раз.",
    checkoutError: "Не удалось открыть страницу оплаты. Попробуйте ещё раз.",
    businessSuspended: "Бизнес приостановлен. Для восстановления обратитесь в поддержку.",
    billingSuspended: "Платежи приостановлены. Выберите действующее предложение и следуйте доступным шагам активации; если онлайн-оплата закрыта, обратитесь в поддержку.",
    subscriptionInactive: "Подписка неактивна. Выберите тариф и следуйте доступным шагам активации; если онлайн-оплата закрыта, обратитесь в поддержку.",
    heroBadge: "Платежи · ваша подписка",
    title: "Тариф и платежи",
    intro: "Выберите тариф по числу активных специалистов, услуг и адресов. Владелец и менеджер не учитываются в лимите, а персональное предложение появится здесь.",
    generalSettings: "Общие настройки",
    currentPlan: "Текущий тариф",
    awaitingActivation: "Ожидает активации",
    individualPlan: "Персональное предложение",
    status: "Статус",
    specialists: "Специалисты",
    specialistHint: "Владелец и менеджер не учитываются",
    services: "Услуги",
    servicesHint: "Текущее количество услуг",
    locations: "Адреса",
    locationsHint: "Лимит филиалов и адресов",
    paymentProvider: "Платёжный сервис",
    awaitingConnection: "Ожидает подключения",
    secureEnvironment: "Статус официального подключения",
    effectiveMonthly: "Эффективная стоимость в месяц",
    customTermsActive: "Персональные условия активны",
    yearlyValue: "Стоимость за год:",
    allToolsIncluded: "Все основные инструменты включены во все тарифы",
    changePlan: "Сменить тариф",
    comparePlans: "Сравните реальные лимиты. Если суперадминистратор создал персональное предложение, оно появится отдельной карточкой с актуальной ценой и сроком.",
    plansLoadError: "Не удалось загрузить доступные тарифы.",
    plansLoading: "Загружаем доступные тарифы…",
    twoMonthsFree: "2 месяца бесплатно",
    active: "Активен",
    perMonthEffective: "Эффективно:",
    perMonth: "/мес.",
    customYearly: "Персональное годовое предложение:",
    savings: "Экономия:",
    oneLocation: "1 адрес",
    unlimitedServices: "Без ограничения услуг",
    featureBooking: "Публичная запись и кабинет клиента",
    featureAnalytics: "Панель записей, аналитика и отслеживание источников",
    featureOwners: "Владелец и менеджер без ограничений",
    currentPlanButton: "Текущий тариф",
    restorePlan: "Восстановить этот тариф",
    payTrialPlan: "Оплатить и активировать",
    createCustomInvoice: "Создать счёт по персональному предложению",
    createYearlyInvoice: "Создать счёт за год",
    createMonthlyInvoice: "Создать счёт за месяц",
    securePayment: "Статус платёжного подключения",
    choosePayment: "Способ платёжного подключения",
    paymentIntro: "Оплата проходит на защищённой странице выбранного сервиса. Тариф активируется после подтверждения сервером.",
    sellerLine: `Получатель платежа: ${LEGAL_ENTITY.legalName} · ИНН ${LEGAL_ENTITY.taxId} · ${LEGAL_ENTITY.email}`,
    autoRenewalOff: "Автоматическое продление не включено: для каждого нового периода создаётся и оплачивается новый счёт.",
    selected: "Выбрано:",
    paymentMethodsAria: "Способы оплаты",
    testEnvironment: "Тестовая среда",
    connected: "Подключено",
    bankAwaiting: "Ожидает подключения банка",
    paymentSafetyNote: "Платёж принимает только способ с отметкой «Подключено». До этого Vizit не собирает данные карты и не списывает деньги с этой страницы.",
    latestInvoice: "Последний счёт",
    invoicesLoading: "Загружаем счета…",
    invoicesLoadError: "Не удалось загрузить счета.",
    noInvoiceTitle: "Счетов пока нет",
    noInvoiceText: "Выберите тариф и создайте счёт. Кнопка оплаты в банке заработает только после официального подключения.",
    invoice: "Счёт",
    planFallback: "Тариф",
    customApplied: "Применено персональное предложение",
    upcomingOffer: (plan: string, date: string) => `Для вас подготовлено персональное предложение (${plan}). Оно начнёт действовать с ${date}.`,
    upcomingOfferPrice: "Цена в месяц:",
    discount: "Скидка:",
    state: "Статус",
    openBankPage: "Открыть банковскую страницу оплаты",
    checkoutText: "После официального подключения оплата откроется на странице банка, а тариф активируется после подтверждённого сервером успешного платежа.",
    providerUnavailable: "Платёжный сервис ещё не подключён. Обратитесь в поддержку.",
    openIdramCheckout: "Оплатить через Idram",
    reviewPayment: "Платёж получен и требует проверки. Свяжитесь с поддержкой, не оплачивая повторно.",
    openLiveCheckout: "Открыть оплату IDBank",
    openTestCheckout: "Открыть тестовую оплату IDBank",
    paymentApproved: "Оплата подтверждена, тариф активирован.",
    invoiceClosed: "Этот счёт больше нельзя оплатить. Выберите тариф и создайте новый счёт.",
    cancelInvoice: "Отменить счёт",
    cancelConfirm: "Отменить этот счёт? Потом можно выбрать тариф и создать новый.",
    cancelError: "Не удалось отменить счёт. Попробуйте ещё раз.",
    payInvoiceTitle: (id: number) => `Счёт #${id}`,
    choosePlanFirst: "Чтобы оплатить, сначала выберите тариф выше и нажмите «Создать счёт».",
    transactionTimeline: "Ход операции",
    reference: "Номер операции",
    noTransactionTitle: "Операции пока нет",
    noTransactionText: "После открытия страницы оплаты здесь появятся номер операции и итоговый статус.",
    activeStaff: (count: number) => `До ${count} активных специалистов`,
    locationLimit: (count: number) => `До ${count} адресов`,
    servicesLimit: (count: number) => `До ${count} услуг`,
    remainingCycles: (count: number) => `Действует ещё ${count} платёжных периодов`,
  },
  en: {
    monthly: "Monthly",
    yearly: "Yearly",
    loadingTitle: "Loading your plan…",
    loadingSubtitle: "Checking your subscription and available offers",
    loadErrorTitle: "Could not load plan details",
    loadErrorText: "Check your connection and try again.",
    retry: "Try again",
    createInvoiceError: "Could not create the invoice. Please try again.",
    checkoutError: "Could not open the payment page. Please try again.",
    businessSuspended: "This business is suspended. Contact support to restore it.",
    billingSuspended: "Billing is suspended. Choose an active offer and follow the available activation steps; contact support if online payment is unavailable.",
    subscriptionInactive: "Your subscription is inactive. Choose a plan and follow the available activation steps; contact support if online payment is unavailable.",
    heroBadge: "Payments · your subscription",
    title: "Plan & payments",
    intro: "Choose a plan by active specialists, services and locations. Owner and manager accounts do not count toward the limit, and any tailored offer will appear here.",
    generalSettings: "General settings",
    currentPlan: "Current plan",
    awaitingActivation: "Awaiting activation",
    individualPlan: "Tailored offer",
    status: "Status",
    specialists: "Specialists",
    specialistHint: "Owner and manager are not counted",
    services: "Services",
    servicesHint: "Current number of services",
    locations: "Locations",
    locationsHint: "Location and branch limit",
    paymentProvider: "Payment service",
    awaitingConnection: "Awaiting connection",
    secureEnvironment: "Official connection status",
    effectiveMonthly: "Effective monthly price",
    customTermsActive: "Tailored terms are active",
    yearlyValue: "Yearly price:",
    allToolsIncluded: "All core tools are included in every plan",
    changePlan: "Change plan",
    comparePlans: "Compare the actual limits. If a super admin creates a tailored offer, it will appear as a separate card with its current price and validity period.",
    plansLoadError: "Could not load available plans.",
    plansLoading: "Loading available plans…",
    twoMonthsFree: "2 months free",
    active: "Active",
    perMonthEffective: "Effective:",
    perMonth: "/month",
    customYearly: "Tailored annual offer:",
    savings: "Savings:",
    oneLocation: "1 location",
    unlimitedServices: "Unlimited services",
    featureBooking: "Public booking and client portal",
    featureAnalytics: "Booking board, analytics and source tracking",
    featureOwners: "Unlimited owner and manager access",
    currentPlanButton: "Current plan",
    restorePlan: "Restore this plan",
    payTrialPlan: "Pay and activate",
    createCustomInvoice: "Create invoice for tailored offer",
    createYearlyInvoice: "Create annual invoice",
    createMonthlyInvoice: "Create monthly invoice",
    securePayment: "Payment connection status",
    choosePayment: "Payment connection method",
    paymentIntro: "Pay on the selected service’s secure page. Your plan activates after server confirmation.",
    sellerLine: `Payment recipient: ${LEGAL_ENTITY.legalName} · Tax ID ${LEGAL_ENTITY.taxId} · ${LEGAL_ENTITY.email}`,
    autoRenewalOff: "Automatic renewal is not enabled; each new period requires a new invoice and payment.",
    selected: "Selected:",
    paymentMethodsAria: "Payment methods",
    testEnvironment: "Test environment",
    connected: "Connected",
    bankAwaiting: "Awaiting bank connection",
    paymentSafetyNote: "Only a method marked “Connected” can accept payment. Until then, Vizit does not collect card details or charge money from this page.",
    latestInvoice: "Latest invoice",
    invoicesLoading: "Loading invoices…",
    invoicesLoadError: "Could not load invoices.",
    noInvoiceTitle: "No invoice yet",
    noInvoiceText: "Choose a plan and create an invoice. The bank payment button works only after the official connection.",
    invoice: "Invoice",
    planFallback: "Plan",
    customApplied: "Tailored offer applied",
    upcomingOffer: (plan: string, date: string) => `A tailored offer (${plan}) is ready for you. It starts on ${date}.`,
    upcomingOfferPrice: "Monthly price:",
    discount: "Discount:",
    state: "Status",
    openBankPage: "Open the bank payment page",
    checkoutText: "After the official connection, payment opens on the bank page and the plan activates only after a server-confirmed successful payment.",
    providerUnavailable: "The payment service is not connected yet. Contact support.",
    openIdramCheckout: "Pay with Idram",
    reviewPayment: "Your payment was received and needs review. Contact support without paying again.",
    openLiveCheckout: "Open IDBank payment",
    openTestCheckout: "Open IDBank test payment",
    paymentApproved: "Payment is confirmed and the plan is active.",
    invoiceClosed: "This invoice can no longer be paid. Choose a plan and create a new invoice.",
    cancelInvoice: "Cancel invoice",
    cancelConfirm: "Cancel this invoice? You can choose a plan and create a new one later.",
    cancelError: "Could not cancel the invoice. Please try again.",
    payInvoiceTitle: (id: number) => `Invoice #${id}`,
    choosePlanFirst: "To pay, first choose a plan above and press Create invoice.",
    transactionTimeline: "Transaction timeline",
    reference: "Reference",
    noTransactionTitle: "No transaction yet",
    noTransactionText: "After opening the payment page, the transaction reference and final status will appear here.",
    activeStaff: (count: number) => `Up to ${count} active specialists`,
    locationLimit: (count: number) => `Up to ${count} locations`,
    servicesLimit: (count: number) => `Up to ${count} services`,
    remainingCycles: (count: number) => `Valid for ${count} more billing cycles`,
  },
} as const;

type IndividualOffer = {
  id: number;
  title: string;
  base_plan: {
    id: number;
    code: string;
    name: string;
    staff_limit: number;
    services_limit?: number | null;
    locations?: number | null;
    currency: string;
  };
  effective_monthly_price: number;
  effective_yearly_price: number;
  discount_amount: number;
  billing_cycles_limit?: number | null;
  used_billing_cycles?: number;
  remaining_billing_cycles?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  note?: string | null;
};

type Invoice = {
  id: number;
  amount: number;
  currency: string;
  billing_cycle?: BillingCycle;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  payment_method?: string | null;
  note?: string | null;
  meta?: {
    base_monthly_amount?: number;
    effective_monthly_amount?: number;
    effective_yearly_amount?: number;
    yearly_months_charged?: number;
    yearly_months_free?: number;
    full_year_amount?: number | null;
    discount_amount?: number;
    pricing_override_id?: number | null;
  } | null;
  plan?: { name: string; code?: string | null } | null;
};

type InvoiceUpgradeResponse = {
  ok: boolean;
  mode: "invoice";
  data: Invoice;
  provider?: {
    default: "idbank" | "idbank_mock" | "idram";
    mode: string;
    checkout_required: boolean;
  };
};

type InstantUpgradeResponse = {
  ok: boolean;
  mode: "instant";
  data: {
    invoice_id: number;
    subscription_status: string;
    plan: { code: string; name: string; price: number; currency: string };
  };
};

type UpgradeResponse = InvoiceUpgradeResponse | InstantUpgradeResponse;

async function fetchPlans(businessType?: string | null): Promise<PublicPlan[]> {
  const r = await api.get("/plans", {
    params: { business_type: businessType ?? undefined },
  });
  return r.data.data as PublicPlan[];
}

async function fetchInvoices(): Promise<Invoice[]> {
  const r = await api.get("/billing/invoices");
  return r.data.data as Invoice[];
}

async function cancelInvoice(invoiceId: number) {
  await api.post(`/billing/invoices/${invoiceId}/cancel`);
}

async function requestUpgrade(planCode: string, billingCycle: BillingCycle) {
  const r = await api.post("/billing/upgrade-request", {
    plan_code: planCode,
    billing_cycle: billingCycle,
  });
  return r.data as UpgradeResponse;
}

function formatMoney(amount: number | null | undefined, currency: string, locale: Locale) {
  if (amount == null) return "—";
  const numberLocale = locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US";
  return `${amount.toLocaleString(numberLocale)} ${currency}`;
}

function cycleLabel(cycle: BillingCycle, locale: Locale) {
  return cycle === "yearly" ? billingCopy[locale].yearly : billingCopy[locale].monthly;
}

const statusNames: Record<Locale, Record<string, string>> = {
  hy: { active: "Ակտիվ", trialing: "Փորձաշրջան", past_due: "Վճարումն ուշացած է", suspended: "Կասեցված", cancelled: "Չեղարկված", canceled: "Չեղարկված", inactive: "Ակտիվ չէ", pending: "Սպասվում է", paid: "Վճարված", failed: "Չհաջողվեց", refunded: "Վերադարձված", expired: "Ժամկետանց" },
  ru: { active: "Активна", trialing: "Пробный период", past_due: "Просрочена оплата", suspended: "Приостановлена", cancelled: "Отменена", canceled: "Отменена", inactive: "Не активна", pending: "Ожидает", paid: "Оплачено", failed: "Не удалось", refunded: "Возвращено", expired: "Истёк срок" },
  en: { active: "Active", trialing: "Trial", past_due: "Past due", suspended: "Suspended", cancelled: "Cancelled", canceled: "Cancelled", inactive: "Inactive", pending: "Pending", paid: "Paid", failed: "Failed", refunded: "Refunded", expired: "Expired" },
};

function statusText(status: string | null | undefined, locale: Locale) {
  const value = String(status ?? "inactive");
  return statusNames[locale][value] ?? value;
}

function statusBadge(status?: string | null) {
  const value = String(status ?? "inactive");
  if (value === "active") return "bg-[var(--vz-success-soft)] text-[var(--vz-success)] border-[var(--vz-success-line)]";
  if (value === "trialing") return "bg-[var(--vz-warning-soft)] text-[var(--vz-warning)] border-[var(--vz-warning-line)]";
  if (value === "suspended") return "bg-[var(--vz-danger-soft)] text-[var(--vz-danger)] border-[var(--vz-danger-line)]";
  return "bg-[var(--vz-surface-2)] text-[var(--vz-text-secondary)] border-[var(--vz-line)]";
}

function requestErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
}

function checkoutErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return message || fallback;
}

function PaymentBrandLogo({ brand }: { brand: PaymentBrand }) {
  const asset = paymentBrandAssets[brand];

  if (!asset) {
    return (
      <span aria-label="Բանկային փոխանցում" className="inline-flex h-8 min-w-[64px] items-center justify-center gap-1.5 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-2 shadow-sm">
        <Landmark className="h-4 w-4 text-[var(--vz-text-secondary)]" aria-hidden="true" />
        <span className="text-[9px] font-black tracking-[0.08em] text-[var(--vz-text-secondary)]">BANK</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex h-8 min-w-[64px] items-center justify-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-2 shadow-sm", asset.badgeClassName)}>
      <img src={asset.src} alt={asset.alt} loading="lazy" className={cn("block h-auto w-auto object-contain", asset.imageClassName)} />
    </span>
  );
}

function SectionCard({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <Card id={id} className={cn("rounded-[24px] border border-[var(--vz-line)] bg-[var(--vz-surface)] shadow-[0_18px_60px_rgba(7,22,36,0.08)]", className)}>
      {children}
    </Card>
  );
}

export default function Billing() {
  const { locale } = useLanguage();
  const copy = billingCopy[locale];
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const billingQ = useQuery({ queryKey: ["billing", "me"], queryFn: fetchBillingMe, staleTime: 20_000 });
  const providerCode = billingQ.data?.payment_provider?.default ?? "idbank";
  const selectedPaymentMethod: PaymentMethodValue = providerCode === "idram" ? "idram-wallet" : "idbank-card";
  const paymentMethods = useMemo(() => paymentMethodDefinitions
    .filter((method) => method.value === selectedPaymentMethod)
    .map((method) => ({ ...method, label: method.label[locale], detail: method.detail[locale] })), [locale, selectedPaymentMethod]);

  const currentBusinessType = billingQ.data?.business.business_type ?? null;
  const plansQ = useQuery({
    queryKey: ["plans", "billing-page", currentBusinessType],
    queryFn: () => fetchPlans(currentBusinessType),
    staleTime: 60_000,
  });
  const invoicesQ = useQuery({ queryKey: ["billing", "invoices"], queryFn: fetchInvoices, staleTime: 20_000 });

  const latestInvoice = invoicesQ.data?.[0] ?? null;
  const targetInvoiceId = currentInvoiceId ?? latestInvoice?.id ?? null;

  const paymentStatusQ = useQuery({
    queryKey: ["billing", "payment-status", targetInvoiceId],
    queryFn: () => getInvoicePaymentStatus(targetInvoiceId as number),
    enabled: !!targetInvoiceId,
    refetchInterval: (q) => {
      const transaction = (q.state.data as { data?: { transaction?: PaymentTransaction | null } } | undefined)?.data?.transaction;
      return transaction?.status === "pending" ? 5000 : false;
    },
  });

  const requestMut = useMutation({
    mutationFn: ({ planCode, cycle }: { planCode: string; cycle: BillingCycle }) => requestUpgrade(planCode, cycle),
    onMutate: () => setUpgradeError(null),
    onSuccess: (data) => {
      const invoiceId = data.mode === "invoice" ? data.data.id : data.data.invoice_id;
      if (invoiceId) setCurrentInvoiceId(invoiceId);
      window.setTimeout(() => document.getElementById("billing-payment")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      void queryClient.invalidateQueries({ queryKey: ["billing", "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error) => setUpgradeError(requestErrorMessage(error, copy.createInvoiceError)),
    onSettled: () => setSelectedPlan(null),
  });

  const checkoutMut = useMutation({
    mutationFn: (invoiceId: number) => createCheckoutSession({ invoice_id: invoiceId, payment_method: providerPaymentMethod(providerCode) }),
    onMutate: () => setCheckoutError(null),
    onSuccess: (data) => {
      setCurrentInvoiceId(data.data.invoice_id);
      if (data.data.checkout_url) {
        rememberPendingCheckout(data.data);
        window.location.href = data.data.checkout_url;
      }
    },
    onError: (error) => setCheckoutError(checkoutErrorMessage(error, copy.checkoutError)),
  });

  const cancelMut = useMutation({
    mutationFn: cancelInvoice,
    onMutate: () => setCheckoutError(null),
    onSuccess: () => {
      setCurrentInvoiceId(null);
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
      void queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error) => setCheckoutError(checkoutErrorMessage(error, copy.cancelError)),
  });
  const confirmCancel = (invoiceId: number) => {
    if (window.confirm(copy.cancelConfirm)) cancelMut.mutate(invoiceId);
  };

  const subscription = billingQ.data?.subscription ?? null;
  const pricing = billingQ.data?.pricing ?? null;
  const currentTransaction = paymentStatusQ.data?.data.transaction ?? null;

  useEffect(() => {
    if (currentTransaction?.status !== "paid") return;

    void queryClient.invalidateQueries({ queryKey: ["billing", "invoices"] });
    void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
    void queryClient.invalidateQueries({ queryKey: ["features"] });
  }, [currentTransaction?.status, queryClient]);

  const individualOffers = useMemo(() => billingQ.data?.individual_offers ?? [], [billingQ.data?.individual_offers]);
  const upcomingOffers = billingQ.data?.upcoming_offers ?? [];

  const presentationPlans = useMemo(() => {
    const standardPlans = (plansQ.data ?? []).filter((plan) => !isCustomPlan(plan)).map((plan) => {
      const monthlyPrice = Number(plan.monthly_price ?? plan.price ?? 0);
      const yearlyPrice = Number(plan.yearly_offer?.price ?? monthlyPrice * 10);
      return {
        id: `plan-${plan.id}`,
        code: plan.code,
        name: localizePlanNameForLocale(plan, locale),
        description: plan.description,
        currency: plan.currency ?? "AMD",
        staff_limit: plan.staff_limit,
        services_limit: plan.services_limit,
        locations: plan.locations,
        monthlyPrice,
        yearlyPrice,
        displayPrice: billingCycle === "yearly" ? yearlyPrice : monthlyPrice,
        discountAmount: plan.yearly_offer?.discount_amount ?? Math.max(monthlyPrice * 12 - yearlyPrice, 0),
        perMonthEffective: Math.round(yearlyPrice / 12),
        isIndividualOffer: false,
        note: null as string | null,
        billingCyclesLimit: null as number | null,
        remainingBillingCycles: null as number | null,
      };
    });

    const offerCards = (individualOffers as IndividualOffer[]).map((offer) => {
      const monthlyPrice = offer.effective_monthly_price;
      const yearlyPrice = offer.effective_yearly_price;
      const isCustomBase = offer.base_plan.code === "custom" || offer.base_plan.staff_limit >= 999;
      return {
        id: `offer-${offer.id}`,
        code: offer.base_plan.code,
        name: offer.title,
        description: `${offer.base_plan.name} · ${isCustomBase ? copy.activeStaff(16).replace("16", "16+") : copy.activeStaff(offer.base_plan.staff_limit)}`,
        currency: offer.base_plan.currency,
        staff_limit: offer.base_plan.staff_limit,
        services_limit: offer.base_plan.services_limit,
        locations: offer.base_plan.locations,
        monthlyPrice,
        yearlyPrice,
        displayPrice: billingCycle === "yearly" ? yearlyPrice : monthlyPrice,
        discountAmount: offer.discount_amount ?? Math.max(monthlyPrice * 12 - yearlyPrice, 0),
        perMonthEffective: Math.round(yearlyPrice / 12),
        isIndividualOffer: true,
        note: offer.note ?? null,
        billingCyclesLimit: offer.billing_cycles_limit ?? null,
        remainingBillingCycles: offer.remaining_billing_cycles ?? null,
      };
    });

    const offerCodes = new Set(offerCards.map((offer) => offer.code));
    const filteredStandard = standardPlans.filter((plan) => !offerCodes.has(plan.code));
    return [...filteredStandard, ...offerCards];
  }, [plansQ.data, individualOffers, billingCycle, copy, locale]);

  const currentPlanCode = subscription?.plan?.code ?? null;
  const hasUsableSubscription = billingQ.data?.is_billable === true
    && (subscription?.status === "active" || subscription?.status === "trialing");
  const currentPlanName = currentPlanCode === "custom" && pricing?.has_override
    ? copy.individualPlan
    : subscription?.plan ? localizePlanNameForLocale(subscription.plan, locale) : null;
  const checkoutAvailable = billingQ.data?.payment_provider?.checkout_available === true;
  const paymentProviderUnavailable = !checkoutAvailable;
  const selectedPayment = paymentMethods.find((method) => method.value === selectedPaymentMethod)
    ?? paymentMethods[0];
  const paymentInvoice = paymentStatusQ.data?.data.invoice;
  const latestInvoiceStatus = paymentInvoice && latestInvoice && paymentInvoice.id === latestInvoice.id
    ? paymentInvoice.status
    : latestInvoice?.status;

  const pendingInvoice = latestInvoice && latestInvoiceStatus === "pending" && !currentTransaction?.requires_manual_review ? latestInvoice : null;
  const payButtonLabel = providerCode === "idram" ? copy.openIdramCheckout : providerCode === "idbank" ? copy.openLiveCheckout : copy.openTestCheckout;
  const payActions = (invoiceId: number) => (
    <div className="mt-4 flex flex-wrap gap-3">
      <Button
        loading={checkoutMut.isPending}
        disabled={paymentProviderUnavailable || cancelMut.isPending || billingQ.data?.reason === "business_suspended"}
        onClick={() => checkoutMut.mutate(invoiceId)}
      >
        {checkoutMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} {payButtonLabel}
      </Button>
      <Button variant="secondary" loading={cancelMut.isPending} disabled={checkoutMut.isPending} onClick={() => confirmCancel(invoiceId)}>
        <X className="h-4 w-4" /> {copy.cancelInvoice}
      </Button>
    </div>
  );

  if (billingQ.isLoading) {
    return <FullScreenLoader title={copy.loadingTitle} subtitle={copy.loadingSubtitle} />;
  }

  if (billingQ.isError) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <SectionCard className="max-w-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-[var(--vz-text)]">{copy.loadErrorTitle}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--vz-text-secondary)]">{copy.loadErrorText}</p>
          <Button className="mt-5" onClick={() => void billingQ.refetch()}>{copy.retry}</Button>
        </SectionCard>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-page space-y-4">
      {!billingQ.data?.is_billable ? (
        <div className={cn("rounded-3xl border px-5 py-4 text-sm leading-7", billingQ.data?.reason === "business_suspended" ? "border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] text-[var(--vz-danger)]" : "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] text-[var(--vz-warning)]")} role="alert">
          {billingQ.data?.reason === "business_suspended"
            ? copy.businessSuspended
            : billingQ.data?.reason === "billing_suspended"
              ? copy.billingSuspended
              : copy.subscriptionInactive}
        </div>
      ) : null}

      <SectionCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(55,138,221,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(132,193,242,0.10),transparent_35%),white] p-5 sm:p-6 lg:p-8">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--vz-brand-text)]">
                <Sparkles className="h-4 w-4 shrink-0" /> {copy.heroBadge}
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--vz-text)] sm:text-4xl">{copy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--vz-text-secondary)]">
                {currentBusinessType === "rentals" ? rentalCopy[locale].subscriptionHelp : copy.intro}
              </p>
            </div>
            <div className="shrink-0 lg:pt-1">
              {billingQ.data?.is_billable ? <Link to="/app/settings"><Button variant="secondary">{copy.generalSettings}</Button></Link> : null}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4 sm:p-5" data-billing-summary>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--vz-muted)]">{copy.currentPlan}</div>
                <div className="mt-1 break-words text-xl font-semibold text-[var(--vz-text)] sm:text-2xl">{currentPlanName ?? copy.awaitingActivation}</div>
              </div>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--vz-accent-soft)] text-[var(--vz-brand-text)]"><Landmark className="h-5 w-5" aria-hidden="true" /></div>
            </div>

            <div className={cn("mt-5 grid grid-cols-1 gap-3", currentBusinessType === "rentals" ? "md:grid-cols-3" : "md:grid-cols-2 2xl:grid-cols-5")} data-billing-stats>
              <div className="min-w-0 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.status}</div>
                <div className="mt-2"><span className={cn("inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold leading-5", statusBadge(subscription?.status))}>{statusText(subscription?.status, locale)}</span></div>
              </div>
              {currentBusinessType !== "rentals" && <>
              <div className="min-w-0 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.specialists}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{billingQ.data?.seats.active_staff ?? 0} / {billingQ.data?.seats.staff_limit ?? "∞"}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--vz-muted)]">{copy.specialistHint}</div>
              </div>
              <div className="min-w-0 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.services}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{billingQ.data?.usage?.services_count ?? 0} / {billingQ.data?.usage?.services_limit ?? "∞"}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--vz-muted)]">{copy.servicesHint}</div>
              </div>
              </>}
              <div className="min-w-0 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.locations}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{billingQ.data?.usage?.locations_count ?? 0} / {billingQ.data?.usage?.locations_limit ?? "∞"}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--vz-muted)]">{copy.locationsHint}</div>
              </div>
              <div className={cn("min-w-0 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4", currentBusinessType !== "rentals" && "md:col-span-2 2xl:col-span-1")}>
                <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.paymentProvider}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{billingQ.data?.payment_provider?.display_name ?? (providerCode === "idram" ? "Idram" : providerCode === "idbank_mock" ? "IDBank Test" : "IDBank V-POS")}</div>
                <div className="mt-1 text-xs leading-5 text-[var(--vz-muted)]">{checkoutAvailable ? copy.connected : copy.awaitingConnection}</div>
              </div>

            </div>

            <div className="mt-5 border-t border-[var(--vz-line)] pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-5 text-[var(--vz-muted)]">{copy.effectiveMonthly}</div>
                  <div className="mt-1 break-words text-2xl font-semibold text-[var(--vz-text)]">{formatMoney(pricing?.effective_monthly_price ?? subscription?.plan?.monthly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD", locale)}</div>
                </div>
                {pricing?.has_override ? <span className="rounded-full border border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] px-3 py-1 text-xs font-semibold text-[var(--vz-success)]">{copy.customTermsActive}</span> : null}
              </div>
              <div className="mt-3 text-sm text-[var(--vz-text-secondary)]">{copy.yearlyValue} {formatMoney(pricing?.effective_yearly_price ?? subscription?.plan?.yearly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD", locale)}</div>
              {pricing?.override?.note ? <div className="mt-3 rounded-xl bg-[var(--vz-accent-soft)] px-4 py-3 text-sm text-[var(--vz-brand-text)]">{pricing.override.note}</div> : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--vz-text-secondary)]">
              <ShieldCheck className="h-3.5 w-3.5" /> {copy.allToolsIncluded}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--vz-text)]">{copy.changePlan}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--vz-text-secondary)]">{copy.comparePlans}</p>
          </div>

          <div className="inline-flex items-center rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-1">
            <button type="button" onClick={() => setBillingCycle("monthly")} className={cn("rounded-[10px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "monthly" ? "bg-[var(--vz-surface)] text-[var(--vz-text)] shadow-sm" : "text-[var(--vz-text-secondary)]")}>{copy.monthly}</button>
            <button type="button" onClick={() => setBillingCycle("yearly")} className={cn("rounded-[10px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "yearly" ? "bg-[var(--vz-primary)] text-[var(--vz-on-primary)]" : "text-[var(--vz-text-secondary)]")}>{copy.yearly}</button>
          </div>
        </div>

        {upcomingOffers.length ? (
          <div className="mt-4 space-y-2">
            {upcomingOffers.map((offer) => (
              <div key={offer.id} className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-3 text-sm text-[var(--vz-text)]">
                <div className="font-medium">
                  {copy.upcomingOffer(
                    offer.base_plan.name,
                    offer.starts_at ? new Date(offer.starts_at).toLocaleDateString(locale === "hy" ? "hy-AM" : locale === "ru" ? "ru-RU" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "—",
                  )}
                </div>
                <div className="mt-1 text-[var(--vz-text-secondary)]">
                  {copy.upcomingOfferPrice} {formatMoney(offer.effective_monthly_price, "AMD", locale)}
                  {offer.note ? ` · ${offer.note}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {plansQ.isError ? (
          <div className="mt-4 rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3 text-sm text-[var(--vz-danger)]">{copy.plansLoadError}</div>
        ) : null}

        {upgradeError ? (
          <div className="mt-4 rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3 text-sm text-[var(--vz-danger)]">{upgradeError}</div>
        ) : null}

        {plansQ.isLoading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-3xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-8 text-sm text-[var(--vz-text-secondary)]">
            <Loader2 className="h-4 w-4 animate-spin" /> {copy.plansLoading}
          </div>
        ) : null}

        <div className={cn("mt-4 grid grid-cols-1 gap-4", presentationPlans.length > 1 && "sm:grid-cols-2 2xl:grid-cols-4")}>
          {presentationPlans.map((plan) => {
            // A trial is not paid yet: its plan must stay purchasable.
            const isCurrent = hasUsableSubscription && subscription?.status === "active" && !plan.isIndividualOffer && currentPlanCode === plan.code;
            const isTrialPlan = subscription?.status === "trialing" && currentPlanCode === plan.code;
            const isRenewal = !hasUsableSubscription && currentPlanCode === plan.code;
            const isBusy = requestMut.isPending && selectedPlan === plan.code;
            return (
              <motion.div key={plan.id} whileHover={{ y: -4 }} className={cn("vizit-billing-plan relative rounded-2xl border p-6 pt-14 shadow-sm", isCurrent && "is-current", isCurrent ? "border-[var(--vz-primary)] bg-[var(--vz-accent-subtle)] text-[var(--vz-text)] shadow-[var(--vz-shadow-sm)]" : plan.isIndividualOffer ? "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)]" : "border-[var(--vz-line)] bg-[var(--vz-surface)]")}>
                {billingCycle === "yearly" && currentBusinessType !== "rentals" ? <div className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold", isCurrent ? "bg-[var(--vz-accent-soft)] text-[var(--vz-accent-text)]" : plan.isIndividualOffer ? "border border-[var(--vz-success-line)] bg-[var(--vz-surface)] text-[var(--vz-success)]" : "bg-[var(--vz-success-soft)] text-[var(--vz-success)]")}>{plan.isIndividualOffer ? copy.individualPlan : copy.twoMonthsFree}</div> : null}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">{plan.name}</div>
                    <div className={cn("mt-1 text-sm", isCurrent ? "text-[var(--vz-muted)]" : plan.isIndividualOffer ? "text-[var(--vz-success)]" : "text-[var(--vz-muted)]")}>{currentBusinessType === "rentals" ? rentalCopy[locale].title : plan.isIndividualOffer ? plan.description : copy.activeStaff(plan.staff_limit ?? 0)}</div>
                  </div>
                  {isCurrent ? <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", "bg-[var(--vz-primary)] text-[var(--vz-on-primary)]")}><BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> {copy.active}</span> : null}
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight">{plan.displayPrice.toLocaleString("hy-AM")}</div>
                  <div className={cn("pb-1 text-sm", "text-[var(--vz-muted)]")}>{plan.currency}</div>
                </div>

                <div className={cn("mt-3 space-y-1 text-sm", "text-[var(--vz-text-secondary)]")}>
                  <div>{billingCycle === "yearly" ? `${copy.perMonthEffective} ~${formatMoney(plan.perMonthEffective, plan.currency, locale)}${copy.perMonth}` : `${formatMoney(plan.monthlyPrice, plan.currency, locale)} ${copy.perMonth}`}</div>
                  {billingCycle === "yearly" ? <div>{plan.isIndividualOffer ? `${copy.customYearly} ${formatMoney(plan.yearlyPrice, plan.currency, locale)}` : `${copy.savings} ${formatMoney(plan.discountAmount, plan.currency, locale)}`}</div> : null}
                  <div>{plan.locations && plan.locations > 1 ? copy.locationLimit(plan.locations) : copy.oneLocation}</div>
                  <div>{currentBusinessType === "rentals" ? rentalCopy[locale].gallery : plan.services_limit && plan.services_limit > 0 ? copy.servicesLimit(plan.services_limit) : copy.unlimitedServices}</div>
                  {plan.billingCyclesLimit ? <div>{copy.remainingCycles(plan.remainingBillingCycles ?? plan.billingCyclesLimit)}</div> : null}
                </div>

                <div className="mt-5 space-y-2">
                  <div className={cn("flex items-center gap-2 text-sm", "text-[var(--vz-text-secondary)]")}><Check className="h-4 w-4 text-[var(--vz-success)]" /> {copy.featureBooking}</div>
                  <div className={cn("flex items-center gap-2 text-sm", "text-[var(--vz-text-secondary)]")}><Check className="h-4 w-4 text-[var(--vz-success)]" /> {copy.featureAnalytics}</div>
                  <div className={cn("flex items-center gap-2 text-sm", "text-[var(--vz-text-secondary)]")}><Check className="h-4 w-4 text-[var(--vz-success)]" /> {copy.featureOwners}</div>
                </div>

                {plan.note ? <div className={cn("mt-4 rounded-xl px-4 py-3 text-sm", isCurrent ? "bg-[var(--vz-accent-soft)] text-[var(--vz-text-secondary)]" : plan.isIndividualOffer ? "border border-[var(--vz-success-line)] bg-[var(--vz-surface)] text-[var(--vz-success)]" : "bg-[var(--vz-accent-soft)] text-[var(--vz-brand-text)]")}>{plan.note}</div> : null}

                <Button className={cn("mt-6 w-full", isCurrent ? "!bg-[var(--vz-accent-soft)] !text-[var(--vz-accent-text)] hover:!bg-[var(--vz-accent-soft)]" : "")} loading={isBusy} disabled={isCurrent || requestMut.isPending || billingQ.data?.reason === "business_suspended"} onClick={() => { setSelectedPlan(plan.code); requestMut.mutate({ planCode: plan.code, cycle: billingCycle }); }}>
                  {isCurrent ? <BadgeCheck className="h-4 w-4" /> : plan.isIndividualOffer ? <Handshake className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {isCurrent ? copy.currentPlanButton : isTrialPlan ? copy.payTrialPlan : isRenewal ? copy.restorePlan : plan.isIndividualOffer ? copy.createCustomInvoice : billingCycle === "yearly" ? copy.createYearlyInvoice : copy.createMonthlyInvoice}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard id="billing-payment" className="scroll-mt-24 overflow-hidden p-0">
        <div className="border-b border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--vz-brand-text)]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {copy.securePayment}
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[var(--vz-text)]">{copy.choosePayment}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">
                {copy.paymentIntro}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-4 py-3 text-sm text-[var(--vz-text-secondary)] shadow-sm">
              {checkoutAvailable ? copy.selected : copy.paymentProvider}{" "}
              <span className="font-semibold text-[var(--vz-text)]">{checkoutAvailable ? selectedPayment.label : copy.awaitingConnection}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className={cn("grid gap-3", paymentMethods.length > 1 && "sm:grid-cols-2")} role="radiogroup" aria-label={copy.paymentMethodsAria}>
            {paymentMethods.map((method) => {
              const isAvailable = method.value === selectedPaymentMethod && checkoutAvailable;
              const isSelected = selectedPaymentMethod === method.value;
              const isTest = providerCode === "idbank_mock";

              return (
                <button
                  key={method.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!isAvailable}
                  className={cn(
                    "group relative min-w-0 rounded-2xl border p-4 text-left transition duration-200 sm:p-5",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--vz-primary)]/25",
                    isSelected && isAvailable
                      ? "border-[var(--vz-primary)] bg-[var(--vz-accent-soft)] shadow-[0_14px_36px_rgba(55,138,221,0.14)]"
                      : "border-[var(--vz-line)] bg-[var(--vz-surface)]",
                    isAvailable
                      ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--vz-line-strong)] hover:shadow-md"
                      : "cursor-not-allowed bg-[var(--vz-surface-2)] opacity-70",
                  )}
                >
                  <span className="flex min-h-9 flex-wrap items-center gap-1.5" aria-hidden="true">
                    {method.brands.map((brand) => <PaymentBrandLogo key={brand} brand={brand} />)}
                  </span>
                  <span className="mt-4 block text-sm font-semibold leading-6 text-[var(--vz-text)]">{method.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--vz-muted)]">{method.detail}</span>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      isAvailable
                        ? isTest
                          ? "border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] text-[var(--vz-warning)]"
                          : "border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] text-[var(--vz-success)]"
                        : "border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-muted)]",
                    )}
                  >
                    {isAvailable ? (isTest ? copy.testEnvironment : copy.connected) : copy.bankAwaiting}
                  </span>
                  {isSelected && isAvailable ? (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[var(--vz-primary)] text-[var(--vz-on-primary)]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {checkoutAvailable ? (
            <div className="mt-5 rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4 sm:p-5">
              {pendingInvoice ? (
                <>
                  <div className="text-sm font-semibold text-[var(--vz-text)]">{copy.payInvoiceTitle(pendingInvoice.id)} · {pendingInvoice.plan?.name ?? copy.planFallback} · {cycleLabel((pendingInvoice.billing_cycle as BillingCycle | undefined) ?? "monthly", locale)}</div>
                  <div className="mt-1 text-2xl font-semibold text-[var(--vz-text)]">{formatMoney(pendingInvoice.amount, pendingInvoice.currency, locale)}</div>
                  {checkoutError ? <div className="mt-3 rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3 text-sm text-[var(--vz-danger)]">{checkoutError}</div> : null}
                  {payActions(pendingInvoice.id)}
                </>
              ) : (
                <p className="text-sm leading-6 text-[var(--vz-text-secondary)]">{copy.choosePlanFirst}</p>
              )}
            </div>
          ) : null}

          <div className="mt-5 flex gap-3 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-3 text-sm leading-6 text-[var(--vz-muted)]" role="note">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vz-brand-text)]" aria-hidden="true" />
            <div className="space-y-1">
              <p>{copy.paymentSafetyNote}</p>
              <p>{copy.sellerLine}</p>
              <p>{copy.autoRenewalOff}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--vz-text-secondary)]"><Landmark className="h-4 w-4 text-[var(--vz-brand-text)]" /> {copy.latestInvoice}</div>
          {invoicesQ.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--vz-text-secondary)]"><Loader2 className="h-4 w-4 animate-spin" /> {copy.invoicesLoading}</div>
          ) : invoicesQ.isError ? (
            <div className="rounded-2xl border border-[var(--vz-danger-line)] bg-[var(--vz-danger-soft)] px-4 py-3 text-sm text-[var(--vz-danger)]">{copy.invoicesLoadError}</div>
          ) : !latestInvoice ? (
            <EmptyState icon={Receipt} title={copy.noInvoiceTitle} description={copy.noInvoiceText} className="border-0 shadow-none" />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--vz-muted)]">{copy.invoice}</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">#{latestInvoice.id} · {latestInvoice.plan?.name ?? copy.planFallback}</div>
                  <div className="mt-1 text-sm text-[var(--vz-text-secondary)]">{formatMoney(latestInvoice.amount, latestInvoice.currency, locale)} · {cycleLabel((latestInvoice.billing_cycle as BillingCycle | undefined) ?? "monthly", locale)}</div>
                  {latestInvoice.meta?.pricing_override_id ? <div className="mt-2 text-sm text-[var(--vz-brand-text)]">{copy.customApplied}</div> : null}
                  {latestInvoice.meta?.discount_amount ? <div className="mt-2 text-sm text-[var(--vz-success)]">{copy.discount} {formatMoney(latestInvoice.meta.discount_amount, latestInvoice.currency, locale)}</div> : null}
                </div>
                <div className="rounded-3xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--vz-muted)]">{copy.state}</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{latestInvoiceStatus}</div>
                  <div className="mt-1 text-sm text-[var(--vz-text-secondary)]">{new Date(latestInvoice.created_at).toLocaleString("hy-AM")}</div>
                </div>
              </div>
              {currentTransaction?.requires_manual_review ? (
                <div role="status" className="rounded-3xl border border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] p-5 text-sm leading-7 text-[var(--vz-warning)]">{copy.reviewPayment}</div>
              ) : latestInvoiceStatus === "pending" ? (
                <div className="rounded-3xl border border-[var(--vz-line)] bg-[var(--vz-surface)] p-5">
                  <div className="text-base font-semibold text-[var(--vz-text)]">{copy.openBankPage}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--vz-text-secondary)]">{copy.checkoutText}</p>
                  {paymentProviderUnavailable ? <div className="mt-3 rounded-2xl border border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] px-4 py-3 text-sm text-[var(--vz-warning)]">{copy.providerUnavailable}</div> : null}
                  {payActions(latestInvoice.id)}
                </div>
              ) : latestInvoiceStatus === "approved" ? (
                <div className="rounded-3xl border border-[var(--vz-success-line)] bg-[var(--vz-success-soft)] p-5 text-sm leading-7 text-[var(--vz-success)]">{copy.paymentApproved}</div>
              ) : (
                <div className="rounded-3xl border border-[var(--vz-warning-line)] bg-[var(--vz-warning-soft)] p-5 text-sm leading-7 text-[var(--vz-warning)]">{copy.invoiceClosed}</div>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--vz-text-secondary)]"><ArrowRight className="h-4 w-4 text-[var(--vz-brand-text)]" /> {copy.transactionTimeline}</div>
          {currentTransaction ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--vz-line)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--vz-muted)]">{copy.reference}</div>
                <div className="mt-2 break-all font-mono text-sm text-[var(--vz-text-secondary)]">{currentTransaction.provider_transaction_id}</div>
              </div>
              <div className="rounded-2xl border border-[var(--vz-line)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--vz-muted)]">{copy.state}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--vz-text)]">{currentTransaction.requires_manual_review ? copy.reviewPayment : statusText(currentTransaction.status, locale)}</div>
                <div className="mt-1 text-sm text-[var(--vz-text-secondary)]">{formatMoney(currentTransaction.amount, currentTransaction.currency, locale)}</div>
              </div>
            </div>
          ) : (
            <EmptyState icon={Sparkles} title={copy.noTransactionTitle} description={copy.noTransactionText} className="border-0 shadow-none" />
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
}
