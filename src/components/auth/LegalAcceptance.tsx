import { Link } from "react-router-dom";

import { useLanguage } from "../../contexts/LanguageContext";

type LegalAcceptanceProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function LegalAcceptance({ id, checked, onChange }: LegalAcceptanceProps) {
  const { locale } = useLanguage();
  const text = {
    hy: {
      prefix: "Կարդացել և ընդունում եմ Vizit-ի",
      terms: "Օգտագործման պայմանները",
      connector: "և",
      privacy: "Գաղտնիության քաղաքականությունը",
      required: "Պարտադիր է հաշիվ ստեղծելու համար։",
      sentenceEnd: "։",
    },
    ru: {
      prefix: "Я прочитал(а) и принимаю",
      terms: "Условия использования",
      connector: "и",
      privacy: "Политику конфиденциальности",
      required: "Это обязательно для создания аккаунта.",
      sentenceEnd: ".",
    },
    en: {
      prefix: "I have read and accept the Vizit",
      terms: "Terms of Use",
      connector: "and",
      privacy: "Privacy Policy",
      required: "This is required to create an account.",
      sentenceEnd: ".",
    },
  }[locale];

  return (
    <div className="rounded-2xl border border-[var(--vz-line)] bg-[var(--vz-surface-2)] px-4 py-3">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--vz-text-secondary)]">
        <input
          id={id}
          name="legal_accepted"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--vz-line-strong)] text-[var(--vz-accent-text)] focus:ring-[var(--vz-focus)]"
        />
        <span>
          {text.prefix}{" "}
          <Link to="/terms" target="_blank" rel="noreferrer" className="font-semibold text-[var(--vz-accent-text)] underline underline-offset-2 dark:text-violet-300">
            {text.terms}
          </Link>{" "}
          {text.connector}{" "}
          <Link to="/privacy-policy" target="_blank" rel="noreferrer" className="font-semibold text-[var(--vz-accent-text)] underline underline-offset-2 dark:text-violet-300">
            {text.privacy}
          </Link>
          {text.sentenceEnd}
          <span className="mt-1 block text-xs text-[var(--vz-muted)]">{text.required}</span>
        </span>
      </label>
    </div>
  );
}
