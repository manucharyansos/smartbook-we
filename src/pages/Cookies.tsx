import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { LEGAL_DOCUMENT_VERSION, LEGAL_ENTITY, legalOperatorSummary } from "../config/legal";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: {
    title: "Cookie-ների և browser storage-ի քաղաքականություն",
    description: "Ինչ cookie-ներ, localStorage և sessionStorage է օգտագործում Vizit.am-ը և ինչպես կարող եք դրանք կառավարել։",
    operatorTitle: "1. Օպերատոր և կիրառման շրջանակ",
    operatorExtra: "Այս քաղաքականությունը վերաբերում է vizit.am-ին, հաշիվների էջերին և հանրային ամրագրման հոսքերին։",
    sections: [
      { title: "2. Ինչ են cookie-ները և տեղային պահոցները", paragraphs: ["Cookie-ն փոքր տվյալ է, որը կայքը պահում է բրաուզերի միջոցով և ուղարկում համապատասխան հարցումների հետ։ localStorage-ն տվյալը պահում է սարքում մինչև ջնջվելը, իսկ sessionStorage-ն՝ սովորաբար մինչև տվյալ ներդիրի կամ session-ի ավարտը։"] },
      { title: "3. Ներկայում օգտագործվող անհրաժեշտ տվյալները", items: ["Մուտքի և session-ի տվյալներ՝ հաշիվը ճանաչելու, պաշտպանված էջերը բացելու և չարտոնված հարցումները կանխելու համար։", "Լեզվի և բաց/մուգ թեմայի նախընտրություն՝ ձեր ընտրությունը հիշելու համար։", "Սարքի պատահական նույնականացուցիչ՝ անվտանգության, trial-ի կրկնակի չարաշահման կանխարգելման և տեխնիկական հուսալիության համար։", "Հյուր ամրագրման ժամանակավոր token՝ միայն տվյալ ամրագրումը անվտանգ դիտելու կամ կառավարելու համար։", "Սոցիալական գրանցման ժամանակավոր context և բիզնեսի լրացվող տվյալներ՝ Google/Facebook հոսքը անվտանգ ավարտելու համար։", "Ինտերֆեյսի տեխնիկական նախընտրություններ, օրինակ՝ dashboard sidebar-ի վիճակը։"] },
      { title: "4. Երրորդ կողմի ծառայություններ", items: ["Քարտեզի բացման ժամանակ Yandex քարտեզի ռեսուրսները կարող են օգտագործել իրենց տեխնիկական cookie-ները կամ պահոցները՝ քարտեզը աշխատեցնելու համար։", "Google կամ Facebook տվյալներ են ստանում միայն այն ժամանակ, երբ ինքներդ ընտրում եք համապատասխան սոցիալական մուտքը։", "Արտաքին վճարային էջը կարող է օգտագործել բանկի կամ վճարային մատակարարի անհրաժեշտ cookie-ները, երբ այդ ինտեգրումը պաշտոնապես ակտիվ է։", "Vizit-ը ներկայում չի օգտագործում գովազդային կամ երրորդ կողմի analytics cookie-ներ։"] },
      { title: "5. Համաձայնություն", paragraphs: ["Ներկայիս պահոցներն անհրաժեշտ են ձեր պահանջած մուտքի, անվտանգության, լեզվի, թեմայի, քարտեզի կամ ամրագրման աշխատանքի համար։ Եթե հետագայում միացվեն ոչ պարտադիր analytics, գովազդային կամ նման գործիքներ, դրանք չեն ակտիվացվի մինչև անհրաժեշտ տեղեկացումը և համաձայնության ընտրությունը։"] },
      { title: "6. Ինչպես կառավարել", items: ["Cookie-ները կարող եք տեսնել, արգելափակել կամ ջնջել բրաուզերի privacy/site-data կարգավորումներում։", "localStorage և sessionStorage տվյալները կարող եք ջնջել բրաուզերի site data բաժնից։", "Անհրաժեշտ տվյալների անջատումը կարող է խանգարել մուտքին, սոցիալական գրանցմանը, լեզվի/թեմայի հիշմանը կամ ամրագրման կառավարմանը։", "Հանրային էջերը կարող եք դիտել առանց հաշվի, սակայն որոշ ինտերակտիվ գործողությունների համար անհրաժեշտ պահոցը պետք է հասանելի լինի։"] },
      { title: "7. Փոփոխություններ և կապ", paragraphs: [`Օգտագործվող տեխնոլոգիաների փոփոխության դեպքում այս էջը կթարմացվի։ Հարցեր՝ ${LEGAL_ENTITY.email}, ${LEGAL_ENTITY.phone}։`] },
    ],
  },
  ru: {
    title: "Политика cookie и browser storage",
    description: "Какие cookie, localStorage и sessionStorage использует Vizit.am и как ими управлять.",
    operatorTitle: "1. Оператор и область применения",
    operatorExtra: "Эта политика применяется к vizit.am, страницам аккаунта и потокам публичной записи.",
    sections: [
      { title: "2. Что такое cookie и локальные хранилища", paragraphs: ["Cookie — небольшой фрагмент данных, который браузер хранит и отправляет с соответствующими запросами. localStorage хранит данные на устройстве до удаления, а sessionStorage — обычно до закрытия вкладки или завершения сессии."] },
      { title: "3. Текущие необходимые данные", items: ["Вход и сессия — чтобы распознавать аккаунт, открывать защищённые страницы и предотвращать неавторизованные запросы.", "Выбранный язык и светлая/тёмная тема.", "Случайный идентификатор устройства для безопасности, предотвращения повторного злоупотребления trial и технической надёжности.", "Временный токен гостевой записи для безопасного просмотра и управления конкретной записью.", "Временный контекст социальной регистрации и данные профиля бизнеса для безопасного завершения Google/Facebook-потока.", "Технические настройки интерфейса, например состояние боковой панели dashboard."] },
      { title: "4. Сторонние сервисы", items: ["При открытии карты ресурсы Yandex могут использовать собственные технические cookie или хранилища для работы карты.", "Google или Facebook получают данные только когда вы выбираете соответствующий социальный вход.", "Внешняя платёжная страница может применять необходимые cookie банка/провайдера после официального подключения интеграции.", "Сейчас Vizit не использует рекламные или сторонние analytics-cookie."] },
      { title: "5. Согласие", paragraphs: ["Текущие хранилища необходимы для запрошенных вами входа, безопасности, языка, темы, карты или записи. Если позже будут подключены необязательные analytics, рекламные или аналогичные инструменты, они не будут активированы до необходимого уведомления и выбора согласия."] },
      { title: "6. Как управлять", items: ["Cookie можно просмотреть, блокировать или удалить в настройках privacy/site data браузера.", "localStorage и sessionStorage удаляются в разделе данных сайта браузера.", "Отключение необходимых данных может нарушить вход, социальную регистрацию, сохранение языка/темы или управление записью.", "Публичные страницы можно просматривать без аккаунта, но для некоторых интерактивных действий хранилище должно быть доступно."] },
      { title: "7. Изменения и контакты", paragraphs: [`При изменении используемых технологий страница будет обновлена. Вопросы: ${LEGAL_ENTITY.email}, ${LEGAL_ENTITY.phone}.`] },
    ],
  },
  en: {
    title: "Cookie and browser-storage policy",
    description: "The cookies, localStorage and sessionStorage used by Vizit.am and how to manage them.",
    operatorTitle: "1. Operator and scope",
    operatorExtra: "This policy applies to vizit.am, account pages and public-booking flows.",
    sections: [
      { title: "2. Cookies and local storage", paragraphs: ["A cookie is a small piece of data stored by the browser and sent with relevant requests. localStorage remains on the device until deleted, while sessionStorage normally lasts until the tab or session ends."] },
      { title: "3. Necessary data currently used", items: ["Login and session data to recognize an account, open protected pages and prevent unauthorized requests.", "Selected language and light/dark theme preferences.", "A random device identifier for security, repeat-trial abuse prevention and technical reliability.", "A temporary guest-booking token to securely view or manage a specific booking.", "Temporary social-registration context and pending business-profile data to safely complete a Google/Facebook flow.", "Technical interface preferences such as dashboard sidebar state."] },
      { title: "4. Third-party services", items: ["When the map is opened, Yandex map resources may use their own technical cookies or storage to operate the map.", "Google or Facebook receives data only when you choose the relevant social sign-in option.", "An external payment page may use necessary bank/provider cookies after that integration is officially active.", "Vizit currently uses no advertising or third-party analytics cookies."] },
      { title: "5. Consent", paragraphs: ["Current storage is necessary for the login, security, language, theme, map or booking function you request. If optional analytics, advertising or similar tools are introduced later, they will not be activated before the required notice and consent choice."] },
      { title: "6. Managing storage", items: ["View, block or delete cookies in the browser's privacy/site-data settings.", "Delete localStorage and sessionStorage from the browser's site-data section.", "Disabling necessary data may prevent login, social registration, language/theme memory or booking management from working.", "Public pages can be viewed without an account, but some interactive actions require storage to be available."] },
      { title: "7. Changes and contact", paragraphs: [`This page will be updated when the technologies in use change. Questions: ${LEGAL_ENTITY.email}, ${LEGAL_ENTITY.phone}.`] },
    ],
  },
} as const;

export default function Cookies() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const sections = [
    {
      title: text.operatorTitle,
      content: (
        <>
          <p>{legalOperatorSummary(locale)}</p>
          <p>{text.operatorExtra}</p>
        </>
      ),
    },
    ...text.sections.map((section) => ({
      title: section.title,
      content: (
        <>
          {"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}
          {"items" in section ? <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </>
      ),
    })),
  ];

  return <LegalPageTemplate title={text.title} description={text.description} updatedAt={LEGAL_DOCUMENT_VERSION} sections={sections} />;
}
