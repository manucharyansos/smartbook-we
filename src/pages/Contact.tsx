import { useState } from "react";
import { motion } from "framer-motion";
import {
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    ShieldCheck,
} from "lucide-react";

import LandingNavbar from "../components/LandingNavbar";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import { fadeUp, pageTransition, scaleIn, staggerContainer } from "../lib/motion";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post("/contact-requests", formData);
            setSent(true);
            setFormData({ name: "", email: "", phone: "", message: "" });
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Չհաջողվեց ուղարկել հաղորդագրությունը։");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="show"
            className="min-h-screen overflow-x-clip bg-slate-50"
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
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-violet-600" />
                                SmartBook կապ
                            </div>

                            <h1 className="mt-6 text-[1.9rem] font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-6xl">
                                Կապ մեզ հետ
                            </h1>

                            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                                Եթե ունես հարց, համագործակցության առաջարկ կամ ցանկանում ես
                                միացնել SmartBook-ը քո բիզնեսին, գրիր մեզ։
                            </p>
                        </motion.div>

                        <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
                            <motion.div variants={scaleIn} className="space-y-6">
                                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <h2 className="text-2xl font-semibold text-slate-900">Կոնտակտներ</h2>

                                    <div className="mt-6 space-y-4">
                                        {[
                                            {
                                                icon: <Phone className="h-5 w-5" />,
                                                label: "Հեռախոս",
                                                value: "+374 (00) 00-00-00",
                                            },
                                            {
                                                icon: <Mail className="h-5 w-5" />,
                                                label: "Էլ. փոստ",
                                                value: "info@smartbook.am",
                                            },
                                            {
                                                icon: <MapPin className="h-5 w-5" />,
                                                label: "Հասցե",
                                                value: "Երևան, Հայաստան",
                                            },
                                            {
                                                icon: <Clock3 className="h-5 w-5" />,
                                                label: "Աշխատանքային ժամեր",
                                                value: "Երկ - Ուրբ, 10:00 - 19:00",
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                                            >
                                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm">
                                                    {item.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm text-slate-500">{item.label}</div>
                                                    <div className="mt-1 break-words font-medium text-slate-900">
                                                        {item.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-slate-900 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-violet-300">
                                        <MessageCircle className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-5 text-2xl font-semibold">Աջակցություն</h3>

                                    <p className="mt-3 text-sm leading-7 text-white/75">
                                        Կարող ենք օգնել կարգավորումների, պլանների և ամրագրման հոսքի հարցերում։
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div variants={scaleIn}>
                                <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-6">
                                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-6">
                                        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                                            <h2 className="text-2xl font-semibold text-slate-900">
                                                Ուղարկել հաղորդագրություն
                                            </h2>
                                            <p className="mt-2 text-sm leading-7 text-slate-500">
                                                Լրացրու ձևը, և մենք կապ կհաստատենք։
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
                                                    Հաղորդագրությունը հաջողությամբ ուղարկվեց։
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
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                                        Անուն
                                                    </label>
                                                    <input
                                                        value={formData.name}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, name: e.target.value })
                                                        }
                                                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                                        placeholder="Ձեր անունը"
                                                    />
                                                </motion.div>

                                                <div className="grid gap-5 sm:grid-cols-2">
                                                    <motion.div variants={fadeUp}>
                                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                                            Էլ. փոստ
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, email: e.target.value })
                                                            }
                                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                                            placeholder="your@email.com"
                                                        />
                                                    </motion.div>

                                                    <motion.div variants={fadeUp}>
                                                        <label className="mb-2 block text-sm font-medium text-slate-700">
                                                            Հեռախոս
                                                        </label>
                                                        <input
                                                            value={formData.phone}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, phone: e.target.value })
                                                            }
                                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                                            placeholder="+374 ..."
                                                        />
                                                    </motion.div>
                                                </div>

                                                <motion.div variants={fadeUp}>
                                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                                        Հաղորդագրություն
                                                    </label>
                                                    <textarea
                                                        rows={6}
                                                        value={formData.message}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, message: e.target.value })
                                                        }
                                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                                                        placeholder="Ինչպե՞ս կարող ենք օգնել..."
                                                    />
                                                </motion.div>

                                                <motion.button
                                                    variants={fadeUp}
                                                    type="submit"
                                                    disabled={loading}
                                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-70"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {loading ? "Ուղարկվում է..." : "Ուղարկել"}
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