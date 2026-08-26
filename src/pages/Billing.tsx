import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Handshake,
  Landmark,
  Loader2,
  Receipt,
  ShieldCheck,
  Sparkles,
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
import type { PublicPlan } from "@/lib/planApi";
import { isCustomPlan, localizePlanNameForLocale } from "@/lib/planPresentation";
import { useLanguage, type Locale } from "@/contexts/LanguageContext";

type BillingCycle = "monthly" | "yearly";
type PaymentBrand = "arca" | "visa" | "mastercard" | "idbank" | "idram" | "telcell" | "easypay" | "fastshift" | "applepay" | "googlepay" | "transfer";
type PaymentMethodValue = "idbank-card" | "idram" | "telcell" | "easypay" | "fastshift" | "applepay" | "googlepay" | "bank-transfer";

const plannedPaymentMethods: Array<{
  value: PaymentMethodValue;
  label: Record<Locale, string>;
  detail: Record<Locale, string>;
  brands: PaymentBrand[];
}> = [
  {
    value: "idbank-card",
    label: { hy: "Բանկային քարտ · IDBank V-POS", ru: "Банковская карта · IDBank V-POS", en: "Bank card · IDBank V-POS" },
    detail: { hy: "Հայկական և միջազգային քարտեր", ru: "Армянские и международные карты", en: "Armenian and international cards" },
    brands: ["arca", "visa", "mastercard", "idbank"],
  },
  {
    value: "idram",
    label: { hy: "Idram և IDBank", ru: "Idram и IDBank", en: "Idram & IDBank" },
    detail: { hy: "Idram հավելված և IDBank էկոհամակարգ", ru: "Приложение Idram и экосистема IDBank", en: "Idram app and the IDBank ecosystem" },
    brands: ["idram", "idbank"],
  },
  {
    value: "telcell",
    label: { hy: "Telcell Wallet", ru: "Telcell Wallet", en: "Telcell Wallet" },
    detail: { hy: "Դրամապանակ և QR վճարում", ru: "Кошелёк и оплата по QR", en: "Wallet and QR payment" },
    brands: ["telcell"],
  },
  {
    value: "easypay",
    label: { hy: "EasyPay · easywallet", ru: "EasyPay · easywallet", en: "EasyPay · easywallet" },
    detail: { hy: "Դրամապանակ և վճարային համակարգ", ru: "Кошелёк и платёжная система", en: "Wallet and payment system" },
    brands: ["easypay"],
  },
  {
    value: "fastshift",
    label: { hy: "Fast Shift", ru: "Fast Shift", en: "Fast Shift" },
    detail: { hy: "Հավելված և օնլայն վճարում", ru: "Приложение и онлайн-оплата", en: "App and online payment" },
    brands: ["fastshift"],
  },
  {
    value: "applepay",
    label: { hy: "Apple Pay", ru: "Apple Pay", en: "Apple Pay" },
    detail: { hy: "Վճարում աջակցվող քարտերով", ru: "Оплата поддерживаемыми картами", en: "Payment with supported cards" },
    brands: ["applepay"],
  },
  {
    value: "googlepay",
    label: { hy: "Google Pay", ru: "Google Pay", en: "Google Pay" },
    detail: { hy: "Վճարում աջակցվող քարտերով", ru: "Оплата поддерживаемыми картами", en: "Payment with supported cards" },
    brands: ["googlepay"],
  },
  {
    value: "bank-transfer",
    label: { hy: "Բանկային փոխանցում", ru: "Банковский перевод", en: "Bank transfer" },
    detail: { hy: "Փոխանցում հաշիվ-ապրանքագրով", ru: "Перевод по выставленному счёту", en: "Transfer against an invoice" },
    brands: ["transfer"],
  },
];

const paymentBrandAssets: Partial<Record<PaymentBrand, { src: string; alt: string; imageClassName?: string; badgeClassName?: string }>> = {
  arca: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Arca_logo_wiki.png",
    alt: "ArCa",
    imageClassName: "max-h-[18px] max-w-[62px]",
  },
  visa: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Visa_Inc._logo_(2021%E2%80%93present).svg",
    alt: "Visa",
    imageClassName: "max-h-[17px] max-w-[58px]",
  },
  mastercard: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mastercard_2019_logo.svg",
    alt: "Mastercard",
    imageClassName: "max-h-[22px] max-w-[38px]",
  },
  idbank: {
    src: "https://idbank.am/images/m-logo.svg",
    alt: "IDBank",
    imageClassName: "max-h-[20px] max-w-[82px]",
  },
  idram: {
    src: "https://www.idram.am/assets/icons/logo.svg",
    alt: "Idram",
    imageClassName: "max-h-[22px] max-w-[76px]",
    badgeClassName: "border-[#243946] bg-[#243946]",
  },
  telcell: {
    src: "https://telcell.am/assets/img/logo.svg",
    alt: "Telcell",
    imageClassName: "max-h-[18px] max-w-[88px]",
  },
  easypay: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Easypay_logo_AM.svg",
    alt: "EasyPay",
    imageClassName: "max-h-[21px] max-w-[82px]",
  },
  fastshift: {
    src: "https://static.ucraft.net/fs/ucraft/userFiles/fastshif/images/logo.png",
    alt: "Fast Shift",
    imageClassName: "max-h-[22px] max-w-[92px]",
  },
  applepay: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Apple_Pay_logo.svg",
    alt: "Apple Pay",
    imageClassName: "max-h-[21px] max-w-[64px]",
  },
  googlepay: {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Google_Pay_Logo.svg",
    alt: "Google Pay",
    imageClassName: "max-h-[21px] max-w-[68px]",
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
    billingSuspended: "Վճարումները կասեցված են։ Ընտրիր գործող առաջարկը և ավարտիր վճարումը՝ աշխատանքային տարածքը վերականգնելու համար։",
    subscriptionInactive: "Բաժանորդագրությունն ակտիվ չէ։ Ընտրիր պլանը և ավարտիր վճարումը՝ աշխատանքային տարածքը վերականգնելու համար։",
    heroBadge: "Վճարումներ · գնագոյացում ըստ մասնագետների",
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
    secureEnvironment: "Պաշտպանված վճարային միջավայր",
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
    createCustomInvoice: "Ստեղծել հաշիվ ըստ անհատական առաջարկի",
    createYearlyInvoice: "Ստեղծել տարեկան վճարման հաշիվ",
    createMonthlyInvoice: "Ստեղծել ամսական վճարման հաշիվ",
    securePayment: "Անվտանգ վճարում",
    choosePayment: "Ընտրել վճարման եղանակը",
    paymentIntro: "Ընտրիր հասանելի եղանակը։ Նոր վճարային համակարգերը կակտիվանան պայմանագրերի, API բանալիների և webhook-ների միացումից հետո։",
    selected: "Ընտրված է՝",
    paymentMethodsAria: "Վճարման եղանակներ",
    testEnvironment: "Թեստային միջավայր",
    connected: "Միացված",
    bankAwaiting: "Սպասում է բանկի միացմանը",
    soon: "Շուտով",
    paymentSafetyNote: "Քարտային վճարումը բացվում է բանկի պաշտպանված էջում։ «Շուտով» նշված տարբերակները չեն ընդունի վճարում, մինչև չավարտվի համապատասխան պրովայդերի պաշտոնական տեխնիկական միացումը։",
    latestInvoice: "Վերջին վճարման հաշիվը",
    invoicesLoading: "Բեռնում ենք վճարման հաշիվները…",
    invoicesLoadError: "Չհաջողվեց բեռնել վճարման հաշիվները։",
    noInvoiceTitle: "Վճարման հաշիվ դեռ չկա",
    noInvoiceText: "Ընտրիր պլանը վերևից, ստեղծիր վճարման հաշիվ և հետո բացիր բանկի վճարման էջը։",
    invoice: "Հաշիվ",
    planFallback: "Պլան",
    customApplied: "Կիրառվել է անհատական առաջարկ",
    discount: "Զեղչ՝",
    state: "Վիճակ",
    openBankPage: "Բացել բանկի վճարման էջը",
    checkoutText: "Վճարումը բացվում է առանձին անվտանգ էջում, իսկ հաստատումից հետո պլանն ակտիվանում է ավտոմատ։",
    providerUnavailable: "IDBank-ի իրական վճարումը դեռ միացված չէ։ Կապվիր աջակցության հետ։",
    openLiveCheckout: "Բացել IDBank վճարման էջը",
    openTestCheckout: "Բացել IDBank թեստային վճարման էջը",
    paymentApproved: "Վճարումը հաստատված է, և պլանն ակտիվացված է։",
    invoiceClosed: "Այս հաշիվն այլևս վճարման ենթակա չէ։ Ընտրիր պլանը և ստեղծիր նոր հաշիվ։",
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
    billingSuspended: "Платежи приостановлены. Выберите действующее предложение и завершите оплату, чтобы восстановить рабочее пространство.",
    subscriptionInactive: "Подписка неактивна. Выберите тариф и завершите оплату, чтобы восстановить рабочее пространство.",
    heroBadge: "Платежи · цена по числу специалистов",
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
    secureEnvironment: "Защищённая платёжная среда",
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
    createCustomInvoice: "Создать счёт по персональному предложению",
    createYearlyInvoice: "Создать счёт за год",
    createMonthlyInvoice: "Создать счёт за месяц",
    securePayment: "Безопасная оплата",
    choosePayment: "Выберите способ оплаты",
    paymentIntro: "Выберите доступный способ. Новые платёжные системы станут активны после подключения договоров, API-ключей и webhook-уведомлений.",
    selected: "Выбрано:",
    paymentMethodsAria: "Способы оплаты",
    testEnvironment: "Тестовая среда",
    connected: "Подключено",
    bankAwaiting: "Ожидает подключения банка",
    soon: "Скоро",
    paymentSafetyNote: "Оплата картой открывается на защищённой странице банка. Способы с пометкой «Скоро» не принимают платежи до завершения официального технического подключения провайдера.",
    latestInvoice: "Последний счёт",
    invoicesLoading: "Загружаем счета…",
    invoicesLoadError: "Не удалось загрузить счета.",
    noInvoiceTitle: "Счетов пока нет",
    noInvoiceText: "Выберите тариф выше, создайте счёт и затем откройте банковскую страницу оплаты.",
    invoice: "Счёт",
    planFallback: "Тариф",
    customApplied: "Применено персональное предложение",
    discount: "Скидка:",
    state: "Статус",
    openBankPage: "Открыть банковскую страницу оплаты",
    checkoutText: "Оплата откроется на отдельной защищённой странице, а после подтверждения тариф активируется автоматически.",
    providerUnavailable: "Оплата через IDBank в рабочем режиме ещё не подключена. Обратитесь в поддержку.",
    openLiveCheckout: "Открыть оплату IDBank",
    openTestCheckout: "Открыть тестовую оплату IDBank",
    paymentApproved: "Оплата подтверждена, тариф активирован.",
    invoiceClosed: "Этот счёт больше нельзя оплатить. Выберите тариф и создайте новый счёт.",
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
    billingSuspended: "Billing is suspended. Choose an active offer and complete payment to restore the workspace.",
    subscriptionInactive: "Your subscription is inactive. Choose a plan and complete payment to restore the workspace.",
    heroBadge: "Payments · pricing by specialist count",
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
    secureEnvironment: "Secure payment environment",
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
    createCustomInvoice: "Create invoice for tailored offer",
    createYearlyInvoice: "Create annual invoice",
    createMonthlyInvoice: "Create monthly invoice",
    securePayment: "Secure payment",
    choosePayment: "Choose a payment method",
    paymentIntro: "Choose an available method. New payment systems will be activated after contracts, API keys and webhooks are connected.",
    selected: "Selected:",
    paymentMethodsAria: "Payment methods",
    testEnvironment: "Test environment",
    connected: "Connected",
    bankAwaiting: "Awaiting bank connection",
    soon: "Coming soon",
    paymentSafetyNote: "Card payments open on the bank's protected page. Methods marked “Coming soon” cannot accept payments until the provider's official technical integration is complete.",
    latestInvoice: "Latest invoice",
    invoicesLoading: "Loading invoices…",
    invoicesLoadError: "Could not load invoices.",
    noInvoiceTitle: "No invoice yet",
    noInvoiceText: "Choose a plan above, create an invoice, then open the bank's payment page.",
    invoice: "Invoice",
    planFallback: "Plan",
    customApplied: "Tailored offer applied",
    discount: "Discount:",
    state: "Status",
    openBankPage: "Open the bank payment page",
    checkoutText: "Payment opens on a separate secure page, and the plan is activated automatically after confirmation.",
    providerUnavailable: "Live IDBank payments are not connected yet. Contact support.",
    openLiveCheckout: "Open IDBank payment",
    openTestCheckout: "Open IDBank test payment",
    paymentApproved: "Payment is confirmed and the plan is active.",
    invoiceClosed: "This invoice can no longer be paid. Choose a plan and create a new invoice.",
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
    default: "idbank" | "idbank_mock";
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

async function requestUpgrade(planCode: string, billingCycle: BillingCycle) {
  const r = await api.post("/billing/upgrade-request", {
    plan_code: planCode,
    payment_method: "card",
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

function statusBadge(status?: string | null) {
  const value = String(status ?? "inactive");
  if (value === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === "trialing") return "bg-amber-50 text-amber-700 border-amber-200";
  if (value === "suspended") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
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
      <span aria-label="Բանկային փոխանցում" className="inline-flex h-8 min-w-[64px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
        <Landmark className="h-4 w-4 text-slate-600" aria-hidden="true" />
        <span className="text-[9px] font-black tracking-[0.08em] text-slate-700">BANK</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex h-8 min-w-[64px] items-center justify-center rounded-xl border border-slate-200 bg-white px-2 shadow-sm", asset.badgeClassName)}>
      <img src={asset.src} alt={asset.alt} loading="lazy" className={cn("block h-auto w-auto object-contain", asset.imageClassName)} />
    </span>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("rounded-[32px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(124,58,237,0.08)]", className)}>
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodValue>("idbank-card");
  const paymentMethods = useMemo(() => plannedPaymentMethods.map((method) => ({
    ...method,
    label: method.label[locale],
    detail: method.detail[locale],
  })), [locale]);

  const billingQ = useQuery({ queryKey: ["billing", "me"], queryFn: fetchBillingMe, staleTime: 20_000 });
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
      void queryClient.invalidateQueries({ queryKey: ["billing", "invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["features"] });
    },
    onError: (error) => setUpgradeError(requestErrorMessage(error, copy.createInvoiceError)),
    onSettled: () => setSelectedPlan(null),
  });

  const checkoutMut = useMutation({
    mutationFn: (invoiceId: number) => createCheckoutSession({ invoice_id: invoiceId, payment_method: "card" }),
    onMutate: () => setCheckoutError(null),
    onSuccess: (data) => {
      setCurrentInvoiceId(data.data.invoice_id);
      if (data.data.checkout_url) window.location.href = data.data.checkout_url;
    },
    onError: (error) => setCheckoutError(checkoutErrorMessage(error, copy.checkoutError)),
  });

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
  const paymentProviderUnavailable = billingQ.data?.payment_provider?.default === "idbank"
    && billingQ.data.payment_provider.live_ready !== true;
  const selectedPayment = paymentMethods.find((method) => method.value === selectedPaymentMethod)
    ?? paymentMethods[0];
  const paymentInvoice = paymentStatusQ.data?.data.invoice;
  const latestInvoiceStatus = paymentInvoice && latestInvoice && paymentInvoice.id === latestInvoice.id
    ? paymentInvoice.status
    : latestInvoice?.status;

  if (billingQ.isLoading) {
    return <FullScreenLoader title={copy.loadingTitle} subtitle={copy.loadingSubtitle} />;
  }

  if (billingQ.isError) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <SectionCard className="max-w-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-950">{copy.loadErrorTitle}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{copy.loadErrorText}</p>
          <Button className="mt-5" onClick={() => void billingQ.refetch()}>{copy.retry}</Button>
        </SectionCard>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="admin-page space-y-4">
      {!billingQ.data?.is_billable ? (
        <div className={cn("rounded-3xl border px-5 py-4 text-sm leading-7", billingQ.data?.reason === "business_suspended" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800")} role="alert">
          {billingQ.data?.reason === "business_suspended"
            ? copy.businessSuspended
            : billingQ.data?.reason === "billing_suspended"
              ? copy.billingSuspended
              : copy.subscriptionInactive}
        </div>
      ) : null}

      <SectionCard className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.10),transparent_35%),white] p-8">
        <div className="flex flex-col gap-5 sm:gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" /> {copy.heroBadge}
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {copy.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {billingQ.data?.is_billable ? <Link to="/app/settings"><Button variant="secondary">{copy.generalSettings}</Button></Link> : null}
              <a href="https://idbank.am/en/business/instruments/trade-finance/v-pos-virtual-pos-terminal-0/" target="_blank" rel="noreferrer">
                <Button>IDBank V-POS <ExternalLink className="h-4 w-4" /></Button>
              </a>
            </div>
          </div>

          <div className="w-full rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.10)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-500">{copy.currentPlan}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{currentPlanName ?? copy.awaitingActivation}</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg"><Landmark className="h-6 w-6" /></div>
            </div>

            <div className="mt-4 grid gap-3 grid-cols-2 xl:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.status}</div>
                <div className="mt-2"><span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusBadge(subscription?.status))}>{subscription?.status ?? "inactive"}</span></div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.specialists}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.seats.active_staff ?? 0} / {billingQ.data?.seats.staff_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">{copy.specialistHint}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.services}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.usage?.services_count ?? 0} / {billingQ.data?.usage?.services_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">{copy.servicesHint}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.locations}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.usage?.locations_count ?? 0} / {billingQ.data?.usage?.locations_limit ?? "∞"}</div>
                <div className="mt-1 text-xs text-slate-500">{copy.locationsHint}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.paymentProvider}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{billingQ.data?.payment_provider?.live_ready ? "IDBank Live" : billingQ.data?.payment_provider?.default === "idbank" ? copy.awaitingConnection : "IDBank Test"}</div>
                <div className="mt-1 text-xs text-slate-500">{copy.secureEnvironment}</div>
              </div>

            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.effectiveMonthly}</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{formatMoney(pricing?.effective_monthly_price ?? subscription?.plan?.monthly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD", locale)}</div>
                </div>
                {pricing?.has_override ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{copy.customTermsActive}</span> : null}
              </div>
              <div className="mt-3 text-sm text-slate-600">{copy.yearlyValue} {formatMoney(pricing?.effective_yearly_price ?? subscription?.plan?.yearly_price, subscription?.plan?.currency ?? pricing?.currency ?? "AMD", locale)}</div>
              {pricing?.override?.note ? <div className="mt-3 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">{pricing.override.note}</div> : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" /> {copy.allToolsIncluded}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{copy.changePlan}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{copy.comparePlans}</p>
          </div>

          <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button type="button" onClick={() => setBillingCycle("monthly")} className={cn("rounded-[14px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600")}>{copy.monthly}</button>
            <button type="button" onClick={() => setBillingCycle("yearly")} className={cn("rounded-[14px] px-4 py-2.5 text-sm font-medium transition", billingCycle === "yearly" ? "bg-violet-600 text-white" : "text-slate-600")}>{copy.yearly}</button>
          </div>
        </div>

        {plansQ.isError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{copy.plansLoadError}</div>
        ) : null}

        {upgradeError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{upgradeError}</div>
        ) : null}

        {plansQ.isLoading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" /> {copy.plansLoading}
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {presentationPlans.map((plan) => {
            const isCurrent = hasUsableSubscription && !plan.isIndividualOffer && currentPlanCode === plan.code;
            const isRenewal = !hasUsableSubscription && currentPlanCode === plan.code;
            const isBusy = requestMut.isPending && selectedPlan === plan.code;
            return (
              <motion.div key={plan.id} whileHover={{ y: -4 }} className={cn("relative rounded-[30px] border p-6 pt-14 shadow-sm", isCurrent ? "border-violet-600 bg-violet-600 text-white shadow-[0_24px_60px_rgba(124,58,237,0.22)]" : plan.isIndividualOffer ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white")}> 
                {billingCycle === "yearly" ? <div className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold", isCurrent ? "bg-white/15 text-white" : plan.isIndividualOffer ? "border border-emerald-200 bg-white text-emerald-700" : "bg-emerald-50 text-emerald-700")}>{plan.isIndividualOffer ? copy.individualPlan : copy.twoMonthsFree}</div> : null}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold">{plan.name}</div>
                    <div className={cn("mt-1 text-sm", isCurrent ? "text-white/70" : plan.isIndividualOffer ? "text-emerald-700" : "text-slate-500")}>{plan.isIndividualOffer ? plan.description : copy.activeStaff(plan.staff_limit ?? 0)}</div>
                  </div>
                  {isCurrent ? <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", isCurrent ? "bg-white/15 text-white" : "bg-violet-50 text-violet-700")}><BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> {copy.active}</span> : null}
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight">{plan.displayPrice.toLocaleString("hy-AM")}</div>
                  <div className={cn("pb-1 text-sm", isCurrent ? "text-white/70" : "text-slate-500")}>{plan.currency}</div>
                </div>

                <div className={cn("mt-3 space-y-1 text-sm", isCurrent ? "text-white/80" : "text-slate-600")}>
                  <div>{billingCycle === "yearly" ? `${copy.perMonthEffective} ~${formatMoney(plan.perMonthEffective, plan.currency, locale)}${copy.perMonth}` : `${formatMoney(plan.monthlyPrice, plan.currency, locale)} ${copy.perMonth}`}</div>
                  {billingCycle === "yearly" ? <div>{plan.isIndividualOffer ? `${copy.customYearly} ${formatMoney(plan.yearlyPrice, plan.currency, locale)}` : `${copy.savings} ${formatMoney(plan.discountAmount, plan.currency, locale)}`}</div> : null}
                  <div>{plan.locations && plan.locations > 1 ? copy.locationLimit(plan.locations) : copy.oneLocation}</div>
                  <div>{plan.services_limit && plan.services_limit < 999 ? copy.servicesLimit(plan.services_limit) : copy.unlimitedServices}</div>
                  {plan.billingCyclesLimit ? <div>{copy.remainingCycles(plan.remainingBillingCycles ?? plan.billingCyclesLimit)}</div> : null}
                </div>

                <div className="mt-5 space-y-2">
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> {copy.featureBooking}</div>
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> {copy.featureAnalytics}</div>
                  <div className={cn("flex items-center gap-2 text-sm", isCurrent ? "text-white/90" : "text-slate-700")}><Check className="h-4 w-4 text-emerald-500" /> {copy.featureOwners}</div>
                </div>

                {plan.note ? <div className={cn("mt-4 rounded-2xl px-4 py-3 text-sm", isCurrent ? "bg-white/10 text-white/85" : plan.isIndividualOffer ? "border border-emerald-200 bg-white text-emerald-800" : "bg-violet-50 text-violet-700")}>{plan.note}</div> : null}

                <Button className={cn("mt-6 w-full", isCurrent ? "bg-white text-violet-700 hover:bg-white/90" : "")} loading={isBusy} disabled={isCurrent || requestMut.isPending || billingQ.data?.reason === "business_suspended"} onClick={() => { setSelectedPlan(plan.code); requestMut.mutate({ planCode: plan.code, cycle: billingCycle }); }}>
                  {isCurrent ? <BadgeCheck className="h-4 w-4" /> : plan.isIndividualOffer ? <Handshake className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {isCurrent ? copy.currentPlanButton : isRenewal ? copy.restorePlan : plan.isIndividualOffer ? copy.createCustomInvoice : billingCycle === "yearly" ? copy.createYearlyInvoice : copy.createMonthlyInvoice}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard className="overflow-hidden p-0">
        <div className="border-b border-[#eadfce] bg-[radial-gradient(circle_at_top_right,rgba(218,165,92,0.14),transparent_38%),linear-gradient(135deg,#fffaf2,#fffdf9)] px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead2a9] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#8b6425]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {copy.securePayment}
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-[#2e102e]">{copy.choosePayment}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {copy.paymentIntro}
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-sm">
              {copy.selected} <span className="font-semibold text-[#3f143c]">{selectedPayment.label}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label={copy.paymentMethodsAria}>
            {paymentMethods.map((method) => {
              const isCard = method.value === "idbank-card";
              const isAvailable = isCard && !paymentProviderUnavailable;
              const isSelected = selectedPaymentMethod === method.value;
              const isTest = isCard && billingQ.data?.payment_provider?.default !== "idbank";

              return (
                <button
                  key={method.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!isAvailable}
                  onClick={() => setSelectedPaymentMethod(method.value)}
                  className={cn(
                    "group relative min-h-[164px] rounded-[24px] border p-4 text-left transition duration-200",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7aa62]/25",
                    isSelected && isAvailable
                      ? "border-[#c98d31] bg-[#fffaf1] shadow-[0_14px_36px_rgba(87,39,77,0.12)]"
                      : "border-slate-200 bg-white",
                    isAvailable
                      ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#d9b06d] hover:shadow-md"
                      : "cursor-not-allowed bg-slate-50/80 opacity-70",
                  )}
                >
                  <span className="flex min-h-9 flex-wrap items-center gap-1.5" aria-hidden="true">
                    {method.brands.map((brand) => <PaymentBrandLogo key={brand} brand={brand} />)}
                  </span>
                  <span className="mt-4 block text-sm font-semibold leading-6 text-slate-950">{method.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{method.detail}</span>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      isAvailable
                        ? isTest
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500",
                    )}
                  >
                    {isAvailable ? (isTest ? copy.testEnvironment : copy.connected) : isCard ? copy.bankAwaiting : copy.soon}
                  </span>
                  {isSelected && isAvailable ? (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#3f143c] text-white">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf3] px-4 py-3 text-sm leading-6 text-[#6d5949]" role="note">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b77a20]" aria-hidden="true" />
            <p>{copy.paymentSafetyNote}</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Landmark className="h-4 w-4 text-violet-600" /> {copy.latestInvoice}</div>
          {invoicesQ.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> {copy.invoicesLoading}</div>
          ) : invoicesQ.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{copy.invoicesLoadError}</div>
          ) : !latestInvoice ? (
            <EmptyState icon={Receipt} title={copy.noInvoiceTitle} description={copy.noInvoiceText} className="border-0 shadow-none" />
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{copy.invoice}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">#{latestInvoice.id} · {latestInvoice.plan?.name ?? copy.planFallback}</div>
                  <div className="mt-1 text-sm text-slate-600">{formatMoney(latestInvoice.amount, latestInvoice.currency, locale)} · {cycleLabel((latestInvoice.billing_cycle as BillingCycle | undefined) ?? "monthly", locale)}</div>
                  {latestInvoice.meta?.pricing_override_id ? <div className="mt-2 text-sm text-violet-700">{copy.customApplied}</div> : null}
                  {latestInvoice.meta?.discount_amount ? <div className="mt-2 text-sm text-emerald-700">{copy.discount} {formatMoney(latestInvoice.meta.discount_amount, latestInvoice.currency, locale)}</div> : null}
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-400">{copy.state}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-950">{latestInvoiceStatus}</div>
                  <div className="mt-1 text-sm text-slate-600">{new Date(latestInvoice.created_at).toLocaleString("hy-AM")}</div>
                </div>
              </div>
              {latestInvoiceStatus === "pending" ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="text-base font-semibold text-slate-950">{copy.openBankPage}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{copy.checkoutText}</p>
                  {paymentProviderUnavailable ? <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{copy.providerUnavailable}</div> : null}
                  {checkoutError ? <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{checkoutError}</div> : null}
                  <Button
                    className="mt-4"
                    loading={checkoutMut.isPending}
                    disabled={selectedPaymentMethod !== "idbank-card" || paymentProviderUnavailable || billingQ.data?.reason === "business_suspended"}
                    onClick={() => checkoutMut.mutate(latestInvoice.id)}
                  >
                    {checkoutMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} {billingQ.data?.payment_provider?.default === "idbank" ? copy.openLiveCheckout : copy.openTestCheckout}
                  </Button>
                </div>
              ) : latestInvoiceStatus === "approved" ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-800">{copy.paymentApproved}</div>
              ) : (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">{copy.invoiceClosed}</div>
              )}
            </>
          )}
        </SectionCard>

        <SectionCard className="space-y-4 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ArrowRight className="h-4 w-4 text-violet-600" /> {copy.transactionTimeline}</div>
          {currentTransaction ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">{copy.reference}</div>
                <div className="mt-2 break-all font-mono text-sm text-slate-700">{currentTransaction.provider_transaction_id}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">{copy.state}</div>
                <div className="mt-2 text-lg font-semibold text-slate-950">{currentTransaction.status}</div>
                <div className="mt-1 text-sm text-slate-600">{formatMoney(currentTransaction.amount, currentTransaction.currency, locale)}</div>
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
