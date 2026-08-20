import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Mail, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/http";
import { fadeUp, pageTransition, scaleIn, staggerContainer } from "../lib/motion";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, whatsappLink } from "../lib/support";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
    hy: {
        badge: "Vizit կապ", title: "Կապ մեզ հետ", intro: "Եթե ունեք հարց, համագործակցության առաջարկ կամ ցանկանում եք միացնել Vizit-ը ձեր բիզնեսին, գրեք մեզ։", contacts: "Կոնտակտներ",
        phone: "Հեռախոս", email: "Էլ. փոստ",
        support: "Աջակցություն", supportText: "Կարող ենք օգնել կարգավորումների, պլանների և ամրագրման հոսքի հարցերում։", whatsapp: "Գրել WhatsApp-ով", whatsappMessage: "Բարև, աջակցության կարիք ունեմ Vizit-ի վերաբերյալ։",
        formTitle: "Ուղարկել հաղորդագրություն", formIntro: "Լրացրեք ձևը, և մենք կապ կհաստատենք։", sent: "Հաղորդագրությունը հաջողությամբ ուղարկվեց։",
        name: "Անուն", namePlaceholder: "Ձեր անունը", emailField: "Էլ. փոստ", phoneField: "Հեռախոս", message: "Հաղորդագրություն", messagePlaceholder: "Ինչպե՞ս կարող ենք օգնել...", sending: "Ուղարկվում է...", send: "Ուղարկել",
        contactRequired: "Նշեք էլ. փոստ կամ հեռախոսահամար, որպեսզի կարողանանք պատասխանել։", sendError: "Չհաջողվեց ուղարկել հաղորդագրությունը։", customPlanMessage: "Ցանկանում եմ ստանալ անհատական պլանի առաջարկ։",
    },
    ru: {
        badge: "Связь с Vizit", title: "Свяжитесь с нами", intro: "Если у вас есть вопрос, предложение о сотрудничестве или вы хотите подключить Vizit к своему бизнесу, напишите нам.", contacts: "Контакты",
        phone: "Телефон", email: "Эл. почта",
        support: "Поддержка", supportText: "Поможем с настройками, тарифами и процессом онлайн-записи.", whatsapp: "Написать в WhatsApp", whatsappMessage: "Здравствуйте! Мне нужна помощь по Vizit.",
        formTitle: "Отправить сообщение", formIntro: "Заполните форму, и мы свяжемся с вами.", sent: "Сообщение успешно отправлено.",
        name: "Имя", namePlaceholder: "Ваше имя", emailField: "Эл. почта", phoneField: "Телефон", message: "Сообщение", messagePlaceholder: "Чем мы можем помочь?", sending: "Отправляем...", send: "Отправить",
        contactRequired: "Укажите электронную почту или телефон, чтобы мы могли ответить.", sendError: "Не удалось отправить сообщение.", customPlanMessage: "Хочу получить индивидуальное предложение по тарифу.",
    },
    en: {
        badge: "Contact Vizit", title: "Contact us", intro: "If you have a question, partnership proposal or want to bring Vizit to your business, send us a message.", contacts: "Contact details",
        phone: "Phone", email: "Email",
        support: "Support", supportText: "We can help with setup, plans and booking flows.", whatsapp: "Message on WhatsApp", whatsappMessage: "Hello! I need help with Vizit.",
        formTitle: "Send a message", formIntro: "Complete the form and we will get back to you.", sent: "Your message was sent successfully.",
        name: "Name", namePlaceholder: "Your name", emailField: "Email", phoneField: "Phone", message: "Message", messagePlaceholder: "How can we help?", sending: "Sending...", send: "Send",
        contactRequired: "Enter an email address or phone number so we can reply.", sendError: "Could not send your message.", customPlanMessage: "I would like a tailored plan proposal.",
    },
};

export default function Contact() {
    const { locale } = useLanguage();
    const text = copy[locale];
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState(() => ({
        name: "",
        email: "",
        phone: "",
        message: searchParams.get("subject") === "custom-plan" ? text.customPlanMessage : "",
    }));

    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSent(false);

        if (!formData.email.trim() && !formData.phone.trim()) {
            setError(text.contactRequired);
            return;
        }

        setLoading(true);

        try {
            await api.post("/contact-requests", formData);
            setSent(true);
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (err: unknown) {
            setError(getErrorMessage(err, text.sendError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="vizit-public-page min-h-screen overflow-x-clip bg-slate-50 text-slate-950 transition-colors dark:bg-[#050816] dark:text-white"
        >
            <LandingNavbar />

            <main className="pt-32 sm:pt-36 lg:pt-40">
                <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                    <motion.div
                        variants={staggerContainer(0.08, 0.05)}
                        initial="hidden"
                        animate="show"
                        className="mx-auto max-w-7xl"
                    >
                        <motion.div variants={fadeUp} className="mb-10 text-center sm:mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:text-slate-200 dark:shadow-black/20">
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                {text.badge}
                            </div>

                            <h1 className="mt-6 text-[1.9rem] font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-6xl">
                                {text.title}
                            </h1>

                            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                                {text.intro}
                            </p>
                        </motion.div>

                        <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
                            <motion.div variants={scaleIn} className="space-y-6">
                                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6">
                                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{text.contacts}</h2>

                                    <div className="mt-6 space-y-4">
                                        {[
                                            {
                                                icon: <Phone className="h-5 w-5" />,
                                                label: text.phone,
                                                value: SUPPORT_PHONE_DISPLAY,
                                                href: `tel:${SUPPORT_PHONE}`,
                                            },
                                            {
                                                icon: <Mail className="h-5 w-5" />,
                                                label: text.email,
                                                value: SUPPORT_EMAIL,
                                                href: `mailto:${SUPPORT_EMAIL}`,
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.055]"
                                            >
                                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-violet-400/15 dark:text-violet-200">
                                                    {item.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
                                                    {item.href ? (
                                                        <a href={item.href} className="mt-1 block break-words font-medium text-slate-900 transition hover:text-violet-700 dark:text-white dark:hover:text-violet-300">{item.value}</a>
                                                    ) : (
                                                        <div className="mt-1 break-words font-medium text-slate-900 dark:text-white">{item.value}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-slate-900 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-300">
                                        <MessageCircle className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-5 text-2xl font-semibold">{text.support}</h3>

                                    <p className="mt-3 text-sm leading-7 text-white/75">
                                        {text.supportText}
                                    </p>
                                    <a href={whatsappLink(SUPPORT_PHONE, text.whatsappMessage)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100">
                                        <MessageCircle className="h-4 w-4" /> {text.whatsapp}
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div variants={scaleIn}>
                                <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 sm:p-6">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
                                        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0d1422] sm:p-8">
                                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                                                {text.formTitle}
                                            </h2>
                                            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                                                {text.formIntro}
                                            </p>

                                            {error ? (
                                                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                    {error}
                                                </div>
                                            ) : null}

                                            {sent ? (
                                                <motion.div
                                                    variants={fadeUp}
                                                    initial="hidden"
                                                    animate="show"
                                                    className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                                                >
                                                    {text.sent}
                                                </motion.div>
                                            ) : null}

                                            <motion.form
                                                variants={staggerContainer(0.08, 0.05)}
                                                initial="hidden"
                                                animate="show"
                                                onSubmit={handleSubmit}
                                                className="mt-6 space-y-5"
                                            >
                                                <motion.div variants={fadeUp}>
                                                    <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {text.name}
                                                    </label>
                                                    <input
                                                        id="contact-name"
                                                        name="name"
                                                        autoComplete="name"
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, name: e.target.value })
                                                        }
                                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-500/15"
                                                        placeholder={text.namePlaceholder}
                                                        required
                                                    />
                                                </motion.div>

                                                <div className="grid gap-5 sm:grid-cols-2">
                                                    <motion.div variants={fadeUp}>
                                                        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {text.emailField}
                                                        </label>
                                                        <input
                                                            id="contact-email"
                                                            name="email"
                                                            autoComplete="email"
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, email: e.target.value })
                                                            }
                                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-500/15"
                                                            placeholder="your@email.com"
                                                        />
                                                    </motion.div>

                                                    <motion.div variants={fadeUp}>
                                                        <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                            {text.phoneField}
                                                        </label>
                                                        <input
                                                            id="contact-phone"
                                                            name="phone"
                                                            type="tel"
                                                            autoComplete="tel"
                                                            value={formData.phone}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, phone: e.target.value })
                                                            }
                                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-500/15"
                                                            placeholder="+374 ..."
                                                        />
                                                    </motion.div>
                                                </div>

                                                <motion.div variants={fadeUp}>
                                                    <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {text.message}
                                                    </label>
                                                    <textarea
                                                        id="contact-message"
                                                        name="message"
                                                        rows={6}
                                                        value={formData.message}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, message: e.target.value })
                                                        }
                                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-500/15"
                                                        placeholder={text.messagePlaceholder}
                                                        required
                                                    />
                                                </motion.div>

                                                <motion.button
                                                    variants={fadeUp}
                                                    type="submit"
                                                    disabled={loading}
                                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-70"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {loading ? text.sending : text.send}
                                                </motion.button>
                                            </motion.form>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </motion.div>
    );
}
