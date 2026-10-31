import type { Locale } from "@/contexts/LanguageContext";

export type TranslatableField = "short_description" | "description";
export type TextTranslations = Partial<Record<TranslatableField, Partial<Record<Locale, string>>>>;

type WithTexts = {
  short_description?: string | null;
  description?: string | null;
  text_translations?: TextTranslations | null;
};

/**
 * The owner's version of a profile text for the visitor's language, or the main text
 * when that language has none.
 */
export function localizedText(source: WithTexts | null | undefined, field: TranslatableField, locale: Locale): string | null {
  if (!source) return null;
  const translated = source.text_translations?.[field]?.[locale]?.trim();
  if (translated) return translated;
  const main = source[field];
  return main && main.trim() ? main : null;
}

export function setTranslation(
  translations: TextTranslations | null | undefined,
  field: TranslatableField,
  locale: Locale,
  value: string,
): TextTranslations {
  return { ...(translations ?? {}), [field]: { ...(translations?.[field] ?? {}), [locale]: value } };
}
