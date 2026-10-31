import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP, whatsappLink } from "../lib/support";
import PaymentLogos from "./PaymentLogos";
import VizitLogo from "./VizitLogo";

type FooterProps = {
  showCta?: boolean;
};

const headingClass = "text-sm font-semibold text-[var(--vz-text)]";
const linkClass = "text-sm text-[var(--vz-muted)] transition-colors hover:text-[var(--vz-text)]";

export default function Footer({ showCta = true }: FooterProps) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t("footer.navigation"),
      links: [
        { to: "/", label: t("nav.home") },
        { to: "/pricing", label: t("nav.pricing") },
        { to: "/about", label: t("nav.about") },
        { to: "/contact", label: t("nav.contact") },
      ],
    },
    {
      title: t("footer.platform"),
      links: [
        { to: "/business", label: t("nav.forBusiness") },
        { to: "/support", label: t("footer.support") },
        { to: "/faq", label: t("footer.faq") },
        { to: "/login", label: t("nav.login") },
        { to: "/register", label: t("footer.register") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { to: "/privacy-policy", label: t("footer.privacy") },
        { to: "/terms", label: t("footer.terms") },
        { to: "/refund-policy", label: t("footer.refund") },
        { to: "/personal-data", label: t("footer.personalData") },
        { to: "/cookies", label: t("footer.cookies") },
      ],
    },
  ];

  const contacts = [
    { href: `tel:${SUPPORT_PHONE}`, label: SUPPORT_PHONE_DISPLAY, Icon: Phone, external: false },
    { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL, Icon: Mail, external: false },
    { href: whatsappLink(SUPPORT_WHATSAPP), label: "WhatsApp", Icon: MessageCircle, external: true },
  ];

  return (
    <footer className="vizit-site-footer border-t border-[var(--vz-line)] bg-[var(--vz-surface)] text-[var(--vz-text)]">
      <div className="mx-auto max-w-[1480px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {showCta ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="vizit-site-footer-cta mb-12 overflow-hidden rounded-[28px] bg-[var(--vz-cover)] text-[var(--vz-cover-text)]"
          >
            <div className="grid gap-7 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--vz-highlight)] px-3 py-1.5 text-xs font-semibold text-[#2A1300] sm:text-sm">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t("footer.badge")}
                </span>
                <h2 className="vizit-display mt-4 max-w-2xl text-2xl font-bold text-[var(--vz-cover-text)] sm:text-3xl lg:text-[34px]">
                  {t("footer.title")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--vz-cover-muted)] sm:text-base">{t("footer.text")}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-[#0F766E] transition hover:bg-[#F0F8F6]"
                >
                  {t("nav.start")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/35 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t("cta.pricing")}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Vizit">
              <VizitLogo />
              <span className="text-xs text-[var(--vz-muted)]">{t("footer.platformTagline")}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--vz-muted)]">{t("footer.description")}</p>

            <div className="mt-6">
              <div className={headingClass}>{t("footer.contacts")}</div>
              <ul className="mt-3 space-y-2.5">
                {contacts.map(({ href, label, Icon, external }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className={`${linkClass} inline-flex items-center gap-2`}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <Icon className="h-4 w-4 text-[var(--vz-accent-text)]" aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <div className={headingClass}>{column.title}</div>
              <ul className="mt-3 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[var(--vz-line)] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-xs font-medium text-[var(--vz-muted)]">{t("footer.weAccept")}</span>
            <PaymentLogos />
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-[var(--vz-muted)]">
            <Lock className="h-3.5 w-3.5 text-[var(--vz-accent-text)]" aria-hidden="true" />
            {t("footer.securePayment")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--vz-line)] pt-6 text-xs text-[var(--vz-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Vizit.am. {t("footer.rights")}
          </span>
          <span>{t("footer.appointmentBusinesses")}</span>
        </div>
      </div>
    </footer>
  );
}
