import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { useLanguage } from "../contexts/LanguageContext";

const UPDATED_AT = "2026-08-18";

const copy = {
  hy: {
    title: "Գաղտնիության քաղաքականություն",
    description: "Ինչ անձնական տվյալներ է մշակում Vizit-ը, ինչ նպատակով և ինչպես կարող եք կառավարել ձեր տվյալները։",
    sections: [
      { title: "1. Ովքեր ենք", paragraphs: ["Vizit-ը օնլայն ամրագրման և բիզնեսի կառավարման հարթակ է ծառայություններ մատուցող բիզնեսների և նրանց հաճախորդների համար։"] },
      { title: "2. Ինչ տվյալներ կարող ենք մշակել", items: ["Հաշվի տվյալներ՝ անուն, էլեկտրոնային հասցե, հեռախոս և դեր։", "Բիզնեսի տվյալներ՝ անվանում, հասցե, կոնտակտներ, ծառայություններ, աշխատակիցներ և աշխատանքային ժամեր։", "Ամրագրման տվյալներ՝ ծառայություն, մասնագետ, ժամանակ, հաճախորդի անուն, հեռախոս, էլեկտրոնային հասցե և նշումներ։", "Տեխնիկական ու անվտանգության տվյալներ՝ IP հասցե, բրաուզերի կամ սարքի տվյալներ և գործողությունների գրանցումներ։"] },
      { title: "3. Մշակման նպատակները", items: ["Հաշիվների, հանրային ամրագրման, օրացույցի և կառավարման գործիքների աշխատանք։", "Հաճախորդների հարցումների ու աջակցության սպասարկում։", "Խարդախության, չարտոնված մուտքի և այլ չարաշահումների կանխարգելում։", "Ծառայության աշխատանքի չափում և բարելավում՝ հնարավորինս սահմանափակ տվյալներով։"] },
      { title: "4. Տվյալների փոխանցում", paragraphs: ["Մենք չենք վաճառում անձնական տվյալները։ Տվյալները կարող են փոխանցվել միայն ծառայությունը տրամադրող ենթակապալառուներին՝ օրինակ հոսթինգի, հաղորդագրությունների կամ վճարումների համար, ինչպես նաև իրավական պարտադիր պահանջի դեպքում։ Յուրաքանչյուր բիզնես ինքնուրույն պատասխանատու է իր հաճախորդների տվյալների օրինական օգտագործման համար։"] },
      { title: "5. Պահպանում և անվտանգություն", paragraphs: ["Տվյալները պահվում են այնքան, որքան անհրաժեշտ է ծառայությունը տրամադրելու, անվտանգությունն ապահովելու, վեճերը լուծելու և օրինական պարտավորությունները կատարելու համար։ Կիրառում ենք տեխնիկական ու կազմակերպչական պաշտպանական միջոցներ, սակայն որևէ առցանց համակարգ չի կարող երաշխավորել բացարձակ անվտանգություն։"] },
      { title: "6. Ձեր իրավունքները", items: ["Պահանջել տեղեկություն կամ ձեր տվյալների պատճենը։", "Ուղղել ոչ ճշգրիտ տվյալները։", "Պահանջել տվյալների ջնջում կամ մշակման սահմանափակում՝ կիրառելի օրենքով թույլատրելի դեպքերում։", "Հետ վերցնել համաձայնությունը, եթե մշակումը հիմնված է համաձայնության վրա։"] },
      { title: "7. Կապ", paragraphs: ["Գաղտնիության հարցերի կամ տվյալների վերաբերյալ դիմումների համար գրեք info@vizit.am հասցեին կամ զանգահարեք +374 98 408 879 համարով։"] },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    description: "Какие персональные данные обрабатывает Vizit, зачем это нужно и как вы можете управлять своими данными.",
    sections: [
      { title: "1. О нас", paragraphs: ["Vizit — платформа онлайн-записи и управления для сервисных компаний и их клиентов."] },
      { title: "2. Какие данные мы можем обрабатывать", items: ["Данные учётной записи: имя, электронная почта, телефон и роль.", "Данные бизнеса: название, адрес, контакты, услуги, сотрудники и рабочие часы.", "Данные записи: услуга, специалист, время, имя клиента, телефон, электронная почта и заметки.", "Технические данные и данные безопасности: IP-адрес, сведения о браузере или устройстве и журналы действий."] },
      { title: "3. Цели обработки", items: ["Работа аккаунтов, публичной записи, календаря и инструментов управления.", "Обработка обращений и поддержка пользователей.", "Предотвращение мошенничества, несанкционированного доступа и иных злоупотреблений.", "Измерение и улучшение работы сервиса с использованием минимально необходимых данных."] },
      { title: "4. Передача данных", paragraphs: ["Мы не продаём персональные данные. Данные могут передаваться поставщикам, необходимым для работы сервиса, например хостинга, сообщений или платежей, а также по обязательному требованию закона. Каждый бизнес самостоятельно отвечает за законное использование данных своих клиентов."] },
      { title: "5. Хранение и безопасность", paragraphs: ["Данные хранятся столько, сколько необходимо для предоставления сервиса, обеспечения безопасности, разрешения споров и выполнения правовых обязанностей. Мы применяем технические и организационные меры защиты, однако ни одна онлайн-система не может гарантировать абсолютную безопасность."] },
      { title: "6. Ваши права", items: ["Запросить информацию или копию своих данных.", "Исправить неточные данные.", "Запросить удаление или ограничение обработки в случаях, предусмотренных применимым законодательством.", "Отозвать согласие, если обработка основана на согласии."] },
      { title: "7. Контакты", paragraphs: ["По вопросам конфиденциальности и данным пишите на info@vizit.am или звоните по номеру +374 98 408 879."] },
    ],
  },
  en: {
    title: "Privacy policy",
    description: "What personal data Vizit processes, why it is needed and how you can manage your data.",
    sections: [
      { title: "1. Who we are", paragraphs: ["Vizit is an online booking and business management platform for service businesses and their customers."] },
      { title: "2. Data we may process", items: ["Account data: name, email address, phone number and role.", "Business data: name, address, contact details, services, staff and working hours.", "Booking data: service, specialist, time, customer name, phone number, email address and notes.", "Technical and security data: IP address, browser or device information and activity logs."] },
      { title: "3. Why we process data", items: ["To operate accounts, public booking, calendars and management tools.", "To handle enquiries and provide support.", "To prevent fraud, unauthorized access and other abuse.", "To measure and improve service performance using the minimum data reasonably needed."] },
      { title: "4. Data sharing", paragraphs: ["We do not sell personal data. Data may be shared with providers required to operate the service, such as hosting, messaging or payment providers, and when disclosure is legally required. Each business is independently responsible for its lawful use of customer data."] },
      { title: "5. Retention and security", paragraphs: ["We keep data for as long as needed to provide the service, maintain security, resolve disputes and meet legal obligations. We use technical and organizational safeguards, but no online system can guarantee absolute security."] },
      { title: "6. Your rights", items: ["Request information or a copy of your data.", "Correct inaccurate data.", "Request deletion or restriction where allowed by applicable law.", "Withdraw consent where processing relies on consent."] },
      { title: "7. Contact", paragraphs: ["For privacy questions or data requests, email info@vizit.am or call +374 98 408 879."] },
    ],
  },
} as const;

export default function PrivacyPolicy() {
  const { locale } = useLanguage();
  const text = copy[locale];

  return (
    <LegalPageTemplate
      title={text.title}
      description={text.description}
      updatedAt={UPDATED_AT}
      sections={text.sections.map((section) => ({
        title: section.title,
        content: (
          <>
            {"paragraphs" in section ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : null}
            {"items" in section ? <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </>
        ),
      }))}
    />
  );
}
