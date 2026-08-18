import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { useLanguage } from "../contexts/LanguageContext";

const UPDATED_AT = "2026-08-18";

const copy = {
  hy: {
    title: "Օգտագործման պայմաններ", description: "Vizit ծառայությունից օգտվելու հիմնական կանոնները, հաշիվների պատասխանատվությունը և վճարովի պլանների պայմանները։",
    sections: [
      { title: "1. Պայմանների ընդունում", paragraphs: ["Vizit-ից օգտվելով՝ դուք համաձայնում եք այս պայմաններին և կիրառելի օրենքներին։ Եթե համաձայն չեք, մի օգտագործեք ծառայությունը։"] },
      { title: "2. Հաշիվներ և հասանելիություն", items: ["Տրամադրեք ճշգրիտ տվյալներ և պահպանեք մուտքի տվյալների գաղտնիությունը։", "Մի փոխանցեք ձեր հաշիվը չարտոնված անձանց և անմիջապես տեղեկացրեք անվտանգության կասկածի մասին։", "Դերերն ու թույլտվությունները գործում են ըստ բիզնեսի կարգավորումների։"] },
      { title: "3. Բիզնեսի և հաճախորդի տվյալներ", paragraphs: ["Բիզնեսը պատասխանատու է իր հրապարակած բովանդակության, ծառայությունների, գների, մասնագետների, ազատ ժամերի և հաճախորդների տվյալների օրինական ու ճշգրիտ օգտագործման համար։ Vizit-ը չի հանդիսանում բիզնեսի մատուցած ծառայության կողմ։"] },
      { title: "4. Ընդունելի օգտագործում", items: ["Արգելվում է չարտոնված մուտքը, համակարգի շրջանցումը, վնասաբեր կոդի տարածումը կամ ծառայության աշխատանքի խափանումը։", "Արգելվում է կեղծ, ապօրինի կամ այլոց իրավունքները խախտող բովանդակությունը։", "Արգելվում է հարթակն օգտագործել սպամի, խարդախության կամ անձնական տվյալների ապօրինի հավաքման համար։"] },
      { title: "5. Հասանելիություն և փոփոխություններ", paragraphs: ["Մենք ձգտում ենք ծառայությունը պահել հասանելի ու կայուն, բայց կարող են լինել սպասարկման աշխատանքներ, թարմացումներ կամ ժամանակավոր ընդհատումներ։ Հնարավորությունները կարող են փոփոխվել՝ անվտանգության, իրավական կամ արտադրանքի զարգացման պատճառներով։"] },
      { title: "6. Վճարներ և պլաններ", paragraphs: ["Վճարովի հնարավորությունները և սահմանաչափերը գործում են ընտրված պլանի ու ցուցադրված վճարման շրջանի համաձայն։ Վճարման ձախողման, ժամկետի ավարտի կամ սահմանաչափի գերազանցման դեպքում որոշ գործառույթներ կարող են սահմանափակվել։ Վերադարձի պայմանները կիրառվում են վճարման պահին ներկայացված պայմաններով և կիրառելի օրենքով։"] },
      { title: "7. Կասեցում և դադարեցում", paragraphs: ["Խախտումների, չարաշահման, անվտանգության ռիսկի կամ պարտադիր իրավական պահանջի դեպքում հաշվի հասանելիությունը կարող է սահմանափակվել կամ դադարեցվել։ Դուք կարող եք դադարեցնել օգտագործումը և դիմել հաշվի փակման համար։"] },
      { title: "8. Կապ", paragraphs: ["Պայմանների վերաբերյալ հարցերի համար գրեք info@vizit.am հասցեին կամ զանգահարեք +374 98 408 879 համարով։"] },
    ],
  },
  ru: {
    title: "Условия использования", description: "Основные правила использования Vizit, ответственность за аккаунт и условия платных тарифов.",
    sections: [
      { title: "1. Принятие условий", paragraphs: ["Используя Vizit, вы соглашаетесь с этими условиями и применимым законодательством. Если вы не согласны, не используйте сервис."] },
      { title: "2. Аккаунты и доступ", items: ["Предоставляйте точные данные и храните данные входа в тайне.", "Не передавайте аккаунт неавторизованным лицам и немедленно сообщайте о подозрении на нарушение безопасности.", "Роли и разрешения действуют в соответствии с настройками бизнеса."] },
      { title: "3. Данные бизнеса и клиентов", paragraphs: ["Бизнес отвечает за законность и точность опубликованного контента, услуг, цен, специалистов, доступного времени и использования данных клиентов. Vizit не является стороной услуги, которую оказывает бизнес."] },
      { title: "4. Допустимое использование", items: ["Запрещены несанкционированный доступ, обход ограничений, распространение вредоносного кода и нарушение работы сервиса.", "Запрещён ложный, незаконный контент и материалы, нарушающие права других лиц.", "Запрещено использовать платформу для спама, мошенничества или незаконного сбора персональных данных."] },
      { title: "5. Доступность и изменения", paragraphs: ["Мы стремимся поддерживать стабильную работу сервиса, но возможны обслуживание, обновления или временные перерывы. Возможности могут меняться по причинам безопасности, права или развития продукта."] },
      { title: "6. Оплата и тарифы", paragraphs: ["Платные возможности и лимиты определяются выбранным тарифом и показанным платёжным периодом. При неудачной оплате, окончании срока или превышении лимитов часть функций может быть ограничена. Возвраты регулируются условиями, показанными при оплате, и применимым законодательством."] },
      { title: "7. Приостановка и прекращение", paragraphs: ["При нарушении условий, злоупотреблении, риске безопасности или обязательном требовании закона доступ к аккаунту может быть ограничен или прекращён. Вы можете прекратить использование и обратиться для закрытия аккаунта."] },
      { title: "8. Контакты", paragraphs: ["По вопросам условий пишите на info@vizit.am или звоните по номеру +374 98 408 879."] },
    ],
  },
  en: {
    title: "Terms of use", description: "The main rules for using Vizit, account responsibilities and paid plan terms.",
    sections: [
      { title: "1. Acceptance", paragraphs: ["By using Vizit, you agree to these terms and applicable law. If you do not agree, do not use the service."] },
      { title: "2. Accounts and access", items: ["Provide accurate information and keep login credentials confidential.", "Do not share your account with unauthorized people and report suspected security issues promptly.", "Roles and permissions operate according to the business settings."] },
      { title: "3. Business and customer data", paragraphs: ["The business is responsible for the lawful and accurate use of its published content, services, prices, staff, availability and customer data. Vizit is not a party to the service supplied by the business."] },
      { title: "4. Acceptable use", items: ["Do not attempt unauthorized access, bypass restrictions, distribute malicious code or disrupt the service.", "Do not publish false or unlawful content or material that infringes another person's rights.", "Do not use the platform for spam, fraud or unlawful collection of personal data."] },
      { title: "5. Availability and changes", paragraphs: ["We aim to keep the service stable and available, but maintenance, updates or temporary interruptions may occur. Features may change for security, legal or product-development reasons."] },
      { title: "6. Fees and plans", paragraphs: ["Paid features and limits follow the selected plan and billing period shown at purchase. Failed payment, expiry or exceeding limits may restrict some functionality. Refunds are governed by the terms shown at payment and applicable law."] },
      { title: "7. Suspension and termination", paragraphs: ["Access may be restricted or terminated for violations, abuse, security risk or a binding legal requirement. You may stop using the service and contact us to close your account."] },
      { title: "8. Contact", paragraphs: ["For questions about these terms, email info@vizit.am or call +374 98 408 879."] },
    ],
  },
} as const;

export default function Terms() {
  const { locale } = useLanguage();
  const text = copy[locale];

  return <LegalPageTemplate title={text.title} description={text.description} updatedAt={UPDATED_AT} sections={text.sections.map((section) => ({ title: section.title, content: <>{"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}{"items" in section ? <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</> }))} />;
}
