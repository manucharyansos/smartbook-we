import { Link } from "react-router-dom";

import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { LEGAL_DOCUMENT_VERSION, LEGAL_ENTITY, legalOperatorSummary } from "../config/legal";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: {
    title: "Անձնական տվյալների մշակման քաղաքականություն",
    description: "Ինչ սկզբունքներով, ինչ հիմքով և որքան ժամկետով է Vizit.am-ը մշակում անձնական տվյալները։",
    operatorTitle: "1. Տվյալներ մշակողը",
    operatorExtra: "Քաղաքականությունը կազմված է «Անձնական տվյալների պաշտպանության մասին» ՀՀ օրենքի համաձայն։ Ավելի մանրամասն՝ ինչ տվյալներ ենք հավաքում և ում ենք փոխանցում, տես",
    privacyLink: "Գաղտնիության քաղաքականությունում",
    sections: [
      { title: "2. Մշակման սկզբունքները", items: ["Օրինականություն և համաչափություն՝ մշակում ենք միայն այն տվյալները, որոնք անհրաժեշտ են կոնկրետ նպատակի համար։", "Հավաստիություն՝ տվյալները պետք է լինեն ճշգրիտ, իսկ սուբյեկտը կարող է պահանջել դրանց ուղղումը։", "Սուբյեկտների նվազագույն ներգրավվածություն և պահպանման սահմանափակ ժամկետ։"] },
      { title: "3. Մշակվող տվյալներ", items: ["Բիզնես հաշիվ՝ անուն, էլ. հասցե, հեռախոս, բիզնեսի անվանում, հասցե, ծառայություններ և աշխատակիցների անուններ։", "Հաճախորդ՝ անուն, հեռախոս, էլ. հասցե, ամրագրման ամսաթիվ և ծառայություն։", "Տեխնիկական՝ IP հասցե, սարքի և բրաուզերի տվյալներ, մուտքի գրառումներ։", "Վճարման քարտի տվյալները Vizit-ը չի տեսնում և չի պահում․ դրանք մուտքագրվում են բանկի պաշտպանված էջում։"] },
      { title: "4. Մշակման հիմքերը և նպատակները", items: ["Համաձայնություն՝ գրանցվելիս կամ ամրագրում կատարելիս։", "Պայմանագրի կատարում՝ հաշիվ, ամրագրում, աջակցություն և պլանի վճարում։", "Օրենքով սահմանված պարտականություններ՝ հաշվապահական և հարկային փաստաթղթեր։", "Օրինական շահ՝ անվտանգություն, խարդախության կանխում և ծառայության բարելավում։"] },
      { title: "5. Պահպանման ժամկետները", items: ["Հաշվի տվյալները պահվում են հաշիվը ակտիվ լինելու ընթացքում և ջնջվում են փակելուց հետո 30 օրվա ընթացքում, բացի օրենքով պարտադիր պահվող տվյալներից։", "Վճարումների և հաշիվ-ապրանքագրերի տվյալները պահվում են ՀՀ օրենսդրությամբ սահմանված ժամկետով։", "Տեխնիկական գրառումները պահվում են մինչև 12 ամիս։"] },
      { title: "6. Պաշտպանություն", items: ["Տվյալները փոխանցվում են գաղտնագրված (HTTPS) կապով։", "Հասանելիությունը սահմանափակված է դերերով, իսկ գաղտնաբառերը պահվում են միայն հեշավորված տեսքով։", "Պարբերաբար կատարվում են պահուստային պատճեններ։"] },
      { title: "7. Ձեր իրավունքները և կապը", items: ["Կարող եք պահանջել ձեր տվյալների մասին տեղեկություն, ուղղում, արգելափակում կամ ոչնչացում, ինչպես նաև հետ վերցնել համաձայնությունը։", `Դիմումները ուղարկեք ${LEGAL_ENTITY.email} հասցեին կամ զանգահարեք ${LEGAL_ENTITY.phone}։ Պատասխանում ենք օրենքով սահմանված ժամկետում։`, "Կարող եք բողոք ներկայացնել ՀՀ արդարադատության նախարարության Անձնական տվյալների պաշտպանության գործակալությանը կամ դատարան։"] },
    ],
  },
  ru: {
    title: "Политика обработки персональных данных",
    description: "На каких принципах, основаниях и в какие сроки Vizit.am обрабатывает персональные данные.",
    operatorTitle: "1. Оператор данных",
    operatorExtra: "Политика составлена в соответствии с Законом РА «О защите персональных данных». Подробнее о том, какие данные мы собираем и кому передаём, — в",
    privacyLink: "Политике конфиденциальности",
    sections: [
      { title: "2. Принципы обработки", items: ["Законность и соразмерность: обрабатываем только данные, необходимые для конкретной цели.", "Достоверность: данные должны быть точными, субъект может потребовать их исправления.", "Минимальное вовлечение субъектов и ограниченный срок хранения."] },
      { title: "3. Обрабатываемые данные", items: ["Бизнес-аккаунт: имя, e-mail, телефон, название бизнеса, адрес, услуги и имена сотрудников.", "Клиент: имя, телефон, e-mail, дата записи и услуга.", "Технические: IP-адрес, данные устройства и браузера, журналы входа.", "Данные платёжной карты Vizit не видит и не хранит: они вводятся на защищённой странице банка."] },
      { title: "4. Основания и цели", items: ["Согласие — при регистрации или записи.", "Исполнение договора — аккаунт, запись, поддержка и оплата тарифа.", "Обязанности по закону — бухгалтерские и налоговые документы.", "Законный интерес — безопасность, предотвращение мошенничества и улучшение сервиса."] },
      { title: "5. Сроки хранения", items: ["Данные аккаунта хранятся, пока аккаунт активен, и удаляются в течение 30 дней после закрытия, кроме данных, обязательных к хранению по закону.", "Данные о платежах и счетах хранятся в сроки, установленные законодательством РА.", "Технические журналы хранятся до 12 месяцев."] },
      { title: "6. Защита", items: ["Данные передаются по зашифрованному соединению (HTTPS).", "Доступ ограничен ролями, пароли хранятся только в хешированном виде.", "Регулярно создаются резервные копии."] },
      { title: "7. Ваши права и контакты", items: ["Вы можете запросить информацию о своих данных, их исправление, блокировку или уничтожение, а также отозвать согласие.", `Отправляйте запросы на ${LEGAL_ENTITY.email} или звоните ${LEGAL_ENTITY.phone}. Мы отвечаем в срок, установленный законом.`, "Вы можете подать жалобу в Агентство по защите персональных данных Министерства юстиции РА или в суд."] },
    ],
  },
  en: {
    title: "Personal data processing policy",
    description: "The principles, legal grounds and retention periods Vizit.am applies when processing personal data.",
    operatorTitle: "1. Data controller",
    operatorExtra: "This policy follows the Law of the Republic of Armenia on Protection of Personal Data. For details on what we collect and who receives it, see the",
    privacyLink: "Privacy policy",
    sections: [
      { title: "2. Principles", items: ["Lawfulness and proportionality: we process only the data needed for a specific purpose.", "Accuracy: data must be correct, and the data subject may ask for it to be corrected.", "Minimal involvement of data subjects and limited retention."] },
      { title: "3. Data we process", items: ["Business account: name, email, phone, business name, address, services and staff names.", "Customer: name, phone, email, booking date and service.", "Technical: IP address, device and browser data, sign-in logs.", "Vizit never sees or stores payment card data: it is entered on the bank's secure page."] },
      { title: "4. Legal grounds and purposes", items: ["Consent, given when registering or booking.", "Performance of a contract: account, bookings, support and plan payments.", "Legal obligations: accounting and tax records.", "Legitimate interest: security, fraud prevention and service improvement."] },
      { title: "5. Retention", items: ["Account data is kept while the account is active and deleted within 30 days of closure, except data the law requires us to keep.", "Payment and invoice records are kept for the period set by Armenian law.", "Technical logs are kept for up to 12 months."] },
      { title: "6. Security", items: ["Data is transmitted over an encrypted (HTTPS) connection.", "Access is role-based, and passwords are stored only as hashes.", "Backups are made regularly."] },
      { title: "7. Your rights and contact", items: ["You may request information about your data, its correction, blocking or deletion, and withdraw consent.", `Send requests to ${LEGAL_ENTITY.email} or call ${LEGAL_ENTITY.phone}. We reply within the period set by law.`, "You may complain to the Personal Data Protection Agency of the Ministry of Justice of Armenia or to a court."] },
    ],
  },
} as const;

export default function PersonalDataPolicy() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const sections = [
    {
      title: text.operatorTitle,
      content: (
        <>
          <p>{legalOperatorSummary(locale)}</p>
          <p>
            {text.operatorExtra}{" "}
            <Link to="/privacy-policy" className="font-semibold underline underline-offset-4">{text.privacyLink}</Link>.
          </p>
        </>
      ),
    },
    ...text.sections.map((section) => ({
      title: section.title,
      content: <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>,
    })),
  ];

  return <LegalPageTemplate title={text.title} description={text.description} updatedAt={LEGAL_DOCUMENT_VERSION} sections={sections} />;
}
