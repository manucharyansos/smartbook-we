import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import VizitLogo from "./VizitLogo";

export default function Footer() {
  const { t } = useLanguage();
  const links = {
    navigation: [
      { to: "/", label: t("nav.home") }, { to: "/pricing", label: t("nav.pricing") },
      { to: "/about", label: t("nav.about") }, { to: "/contact", label: t("nav.contact") },
    ],
    product: [
      { to: "/business", label: t("nav.forBusiness") }, { to: "/support", label: t("footer.support") },
      { to: "/faq", label: t("footer.faq") }, { to: "/login", label: t("nav.login") },
      { to: "/register", label: t("footer.register") },
    ],
    legal: [
      { to: "/privacy-policy", label: t("footer.privacy") }, { to: "/terms", label: t("footer.terms") },
      { to: "/cookies", label: t("footer.cookies") },
    ],
  };

  return (
    <footer className="vizit-footer relative overflow-hidden border-t border-[#d39a43]/20 bg-[#fbf5ed] transition-colors dark:border-[#edc982]/15 dark:bg-[#120b14]">
      <div className="pointer-events-none absolute -left-48 top-28 h-96 w-96 rounded-full border border-[#d39a43]/15" />
      <div className="pointer-events-none absolute -right-44 -top-40 h-[430px] w-[430px] rounded-full border border-[#6d2a63]/10 dark:border-[#edc982]/10" />

      <div className="relative mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="vizit-footer-cta relative overflow-hidden rounded-[34px] border border-[#d39a43]/25 bg-[radial-gradient(circle_at_88%_0%,rgba(237,201,130,0.28),transparent_34%),linear-gradient(135deg,#2b0d35_0%,#4b164b_58%,#6d2a63_100%)] text-white shadow-[0_30px_90px_rgba(75,36,52,0.20)]"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 left-[30%] h-80 w-80 rounded-full border border-[#edc982]/18" />

          <div className="relative grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#edc982]/30 bg-[#edc982]/10 px-3 py-2 text-xs font-semibold text-[#f4d99f] sm:text-sm">
                <Sparkles className="h-4 w-4" />
                {t("footer.badge")}
              </div>

              <h2 className="vizit-display mt-5 max-w-2xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl lg:text-[38px]">
                {t("footer.title")}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                {t("footer.text")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#fff8ef] px-6 py-3.5 text-sm font-bold text-[#2b0d35] shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition hover:bg-white"
              >
                {t("nav.start")}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-[#edc982]/30 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.11]"
              >
                {t("cta.pricing")}
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="vizit-footer-brand flex items-center gap-3">
              <VizitLogo />
              <div>
                <div className="text-xs text-[#8b7a86] dark:text-white/55">{t("footer.platformTagline")}</div>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#756777] dark:text-white/60">
              {t("footer.description")}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/20 bg-[#fffaf5] px-3 py-2 text-xs font-semibold text-[#5f4c61] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/65">
                <ShieldCheck className="h-3.5 w-3.5 text-[#c88e37]" />
                {t("footer.onlineBooking")}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d39a43]/20 bg-[#fffaf5] px-3 py-2 text-xs font-semibold text-[#5f4c61] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/65">
                <Mail className="h-3.5 w-3.5 text-[#c88e37]" />
                {t("footer.supportAvailable")}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-[#2b0d35] dark:text-white">{t("footer.navigation")}</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[#756777] dark:text-white/55">
              {links.navigation.map((item) => (
                <Link key={item.to} to={item.to} className="transition hover:text-[#2b0d35] dark:hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-[#2b0d35] dark:text-white">{t("footer.platform")}</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[#756777] dark:text-white/55">
              {links.product.map((item) => (
                <Link key={item.to} to={item.to} className="transition hover:text-[#2b0d35] dark:hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-[#2b0d35] dark:text-white">{t("footer.legal")}</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[#756777] dark:text-white/55">
              {links.legal.map((item) => (
                <Link key={item.to} to={item.to} className="transition hover:text-[#2b0d35] dark:hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#d39a43]/18 pt-5 text-center text-sm text-[#8b7a86] dark:border-white/10 dark:text-white/45 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} Vizit.am. {t("footer.rights")}</span>
          <span>{t("footer.appointmentBusinesses")}</span>
        </div>
      </div>
    </footer>
  );
}
