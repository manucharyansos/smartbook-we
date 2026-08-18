import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { useLanguage } from "../contexts/LanguageContext";

const UPDATED_AT = "2026-08-18";

const copy = {
  hy: {
    title: "Cookie-ների քաղաքականություն", description: "Ինչ cookie-ներ և տեղային պահոցներ է օգտագործում Vizit-ը, ինչ նպատակով և ինչպես կարող եք դրանք կառավարել։",
    sections: [
      { title: "1. Ինչ են cookie-ները", paragraphs: ["Cookie-ները փոքր տվյալներ են, որոնք կայքը պահում է բրաուզերում։ Vizit-ը կարող է նաև օգտագործել localStorage կամ sessionStorage՝ նույնատիպ անհրաժեշտ գործառույթների համար։"] },
      { title: "2. Անհրաժեշտ cookie-ներ և պահոցներ", items: ["Մուտք և session՝ հաշվի հասանելիությունն ու անվտանգությունը պահպանելու համար։", "CSRF և հարցումների ստուգում՝ կեղծ կամ չարտոնված հարցումներից պաշտպանվելու համար։", "Նախընտրություններ՝ օրինակ ընտրված լեզուն կամ թեման հիշելու համար։", "Հյուր ամրագրման ժամանակավոր token՝ ձեր ամրագրումը անվտանգ կառավարելու համար։"] },
      { title: "3. Վերլուծություն և երրորդ կողմեր", paragraphs: ["Եթե միացվեն վերլուծական կամ այլ ոչ պարտադիր գործիքներ, դրանց կիրառման ու համաձայնության մասին տեղեկատվությունը կթարմացվի այստեղ և, անհրաժեշտության դեպքում, կցուցադրվի ընտրության վահանակ։"] },
      { title: "4. Կառավարում", paragraphs: ["Cookie-ները կարող եք արգելափակել կամ ջնջել բրաուզերի կարգավորումներով։ Անհրաժեշտ cookie-ների կամ տեղային տվյալների անջատումը կարող է խանգարել մուտքին, անվտանգությանը կամ ամրագրումների կառավարմանը։"] },
      { title: "5. Կապ", paragraphs: ["Cookie-ների օգտագործման վերաբերյալ հարցերի համար գրեք info@vizit.am հասցեին կամ զանգահարեք +374 98 408 879 համարով։"] },
    ],
  },
  ru: {
    title: "Политика cookie", description: "Какие cookie и локальные хранилища использует Vizit, зачем они нужны и как ими управлять.",
    sections: [
      { title: "1. Что такое cookie", paragraphs: ["Cookie — небольшие данные, которые сайт сохраняет в браузере. Vizit также может использовать localStorage или sessionStorage для аналогичных необходимых функций."] },
      { title: "2. Необходимые cookie и хранилища", items: ["Вход и сессия — для доступа к аккаунту и его безопасности.", "CSRF и проверка запросов — для защиты от поддельных и неавторизованных запросов.", "Предпочтения — например, для запоминания выбранного языка или темы.", "Временный токен гостевой записи — для безопасного управления вашей записью."] },
      { title: "3. Аналитика и третьи стороны", paragraphs: ["Если будут подключены аналитические или иные необязательные инструменты, информация об их использовании и согласии будет обновлена здесь и, когда требуется, показана в панели выбора."] },
      { title: "4. Управление", paragraphs: ["Cookie можно блокировать или удалять в настройках браузера. Отключение необходимых cookie или локальных данных может нарушить вход, безопасность или управление записями."] },
      { title: "5. Контакты", paragraphs: ["По вопросам использования cookie пишите на info@vizit.am или звоните по номеру +374 98 408 879."] },
    ],
  },
  en: {
    title: "Cookie policy", description: "The cookies and local storage Vizit uses, why they are needed and how you can manage them.",
    sections: [
      { title: "1. What cookies are", paragraphs: ["Cookies are small pieces of data stored by a website in your browser. Vizit may also use localStorage or sessionStorage for similar necessary functions."] },
      { title: "2. Necessary cookies and storage", items: ["Login and session data to keep account access working and secure.", "CSRF and request validation to protect against forged or unauthorized requests.", "Preferences, such as remembering the selected language or theme.", "A temporary guest-booking token so you can manage your booking securely."] },
      { title: "3. Analytics and third parties", paragraphs: ["If analytics or other optional tools are introduced, information about their use and consent will be updated here and, where required, presented in a choice panel."] },
      { title: "4. Managing storage", paragraphs: ["You can block or delete cookies in your browser settings. Disabling necessary cookies or local data may prevent login, security controls or booking management from working correctly."] },
      { title: "5. Contact", paragraphs: ["For questions about cookie use, email info@vizit.am or call +374 98 408 879."] },
    ],
  },
} as const;

export default function Cookies() {
  const { locale } = useLanguage();
  const text = copy[locale];

  return <LegalPageTemplate title={text.title} description={text.description} updatedAt={UPDATED_AT} sections={text.sections.map((section) => ({ title: section.title, content: <>{"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}{"items" in section ? <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</> }))} />;
}
