import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const links = {
    navigation: [
      { to: "/", label: t("nav.home") }, { to: "/pricing", label: t("nav.pricing") },
      { to: "/about", label: t("nav.about") }, { to: "/contact", label: t("nav.contact") },
    ],
    product: [
      { to: "/features", label: t("footer.features") }, { to: "/support", label: t("footer.support") },
      { to: "/faq", label: t("footer.faq") }, { to: "/login", label: t("nav.login") },
      { to: "/register", label: t("footer.register") },
    ],
    legal: [
      { to: "/privacy-policy", label: t("footer.privacy") }, { to: "/terms", label: t("footer.terms") },
      { to: "/cookies", label: t("footer.cookies") },
    ],
  };
  return (
      <footer className="relative border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-[0_26px_90px_rgba(15,23,42,0.16)]"
          >
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 xl:grid-cols-[1fr_auto] xl:items-center lg:px-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  {t("footer.badge")}
                </div>

                <h2 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[36px]">
                  {t("footer.title")}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  {t("footer.text")}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {t("nav.start")}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {t("cta.pricing")}
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <Link to="/" className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-950">
                    Vizit
                  </div>
                  <div className="text-xs text-slate-500">{t("footer.platformTagline")}</div>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
                {t("footer.description")}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
                  {t("footer.onlineBooking")}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                  <Mail className="h-3.5 w-3.5 text-violet-600" />
                  {t("footer.supportAvailable")}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-950">{t("footer.navigation")}</div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                {links.navigation.map((item) => (
                    <Link key={item.to} to={item.to} className="transition hover:text-slate-950">
                      {item.label}
                    </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-950">{t("footer.platform")}</div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                {links.product.map((item) => (
                    <Link key={item.to} to={item.to} className="transition hover:text-slate-950">
                      {item.label}
                    </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-950">{t("footer.legal")}</div>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
                {links.legal.map((item) => (
                    <Link key={item.to} to={item.to} className="transition hover:text-slate-950">
                      {item.label}
                    </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-center text-sm text-slate-500 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <span>© {new Date().getFullYear()} Vizit. {t("footer.rights")}</span>
            <span>{t("footer.appointmentBusinesses")}</span>
          </div>
        </div>
      </footer>
  );
}
