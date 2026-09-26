import type { Locale } from "../contexts/LanguageContext";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "../lib/support";

export const LEGAL_DOCUMENT_VERSION = "2026-09-26";

export const LEGAL_ENTITY = {
  tradeName: "Vizit.am",
  legalName: "ՍՈՍ ՄԱՆՈՒՉԱՐՅԱՆ ԱՐՄԵՆԻ Ա/Ձ",
  registrationNumber: "286.04251",
  registrationDate: "04.02.2010",
  taxId: "37444764",
  email: SUPPORT_EMAIL,
  phone: SUPPORT_PHONE_DISPLAY,
  registeredLocation: {
    hy: "ՀՀ, Տավուշի մարզ, Բերդ, 6-րդ փողոց, տուն 1, 4216",
    ru: "Республика Армения, Тавушская область, г. Берд, 6-я улица, дом 1, 4216",
    en: "Republic of Armenia, Tavush Province, Berd, 6th Street, House 1, 4216",
  },
} as const;

export function legalOperatorSummary(locale: Locale): string {
  const address = LEGAL_ENTITY.registeredLocation[locale];

  if (locale === "ru") {
    return `${LEGAL_ENTITY.tradeName} управляется индивидуальным предпринимателем «${LEGAL_ENTITY.legalName}». Регистрационный номер: ${LEGAL_ENTITY.registrationNumber}; дата регистрации: ${LEGAL_ENTITY.registrationDate}; ИНН: ${LEGAL_ENTITY.taxId}; местонахождение по государственному реестру: ${address}.`;
  }

  if (locale === "en") {
    return `${LEGAL_ENTITY.tradeName} is operated by the Armenian individual entrepreneur “${LEGAL_ENTITY.legalName}”. Registration number: ${LEGAL_ENTITY.registrationNumber}; registration date: ${LEGAL_ENTITY.registrationDate}; tax identification number: ${LEGAL_ENTITY.taxId}; location recorded in the state register: ${address}.`;
  }

  return `${LEGAL_ENTITY.tradeName}-ը շահագործվում է «${LEGAL_ENTITY.legalName}»-ի կողմից։ Պետական գրանցման համար՝ ${LEGAL_ENTITY.registrationNumber}, գրանցման ամսաթիվ՝ ${LEGAL_ENTITY.registrationDate}, ՀՎՀՀ՝ ${LEGAL_ENTITY.taxId}, պետական ռեգիստրում նշված գտնվելու վայր՝ ${address}։`;
}

export function legalFooterSummary(locale: Locale): string {
  if (locale === "ru") {
    return `${LEGAL_ENTITY.legalName} · ИНН ${LEGAL_ENTITY.taxId} · рег. № ${LEGAL_ENTITY.registrationNumber}`;
  }

  if (locale === "en") {
    return `${LEGAL_ENTITY.legalName} · Tax ID ${LEGAL_ENTITY.taxId} · Reg. No. ${LEGAL_ENTITY.registrationNumber}`;
  }

  return `${LEGAL_ENTITY.legalName} · ՀՎՀՀ ${LEGAL_ENTITY.taxId} · գրանցման համար ${LEGAL_ENTITY.registrationNumber}`;
}
