import LegalPageTemplate from "../components/marketing/LegalPageTemplate";
import { LEGAL_DOCUMENT_VERSION, LEGAL_ENTITY, legalOperatorSummary } from "../config/legal";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: {
    title: "Չեղարկման և վերադարձի քաղաքականություն",
    description: "Ինչպես չեղարկել Vizit-ի բաժանորդագրությունը, երբ է հնարավոր գումարի վերադարձը և ինչ պայմաններով։",
    operatorTitle: "1. Ում է վերաբերում",
    operatorExtra: "Այս քաղաքականությունը վերաբերում է vizit.am-ում բանկային քարտով կամ Idram-ով կատարված Vizit-ի SaaS պլանների (բաժանորդագրությունների) վճարումներին։",
    sections: [
      { title: "2. Ինչ ենք վաճառում", items: ["Vizit-ը վաճառում է թվային ծառայություն՝ առցանց ամրագրումների և բիզնեսի կառավարման հարթակի ամսական կամ տարեկան պլան։ Ֆիզիկական ապրանք չի առաքվում։", "Պլանների գները՝ ՀՀ դրամով, ներառյալ կիրառելի հարկերը, հրապարակված են /pricing էջում և ցուցադրվում են վճարումից առաջ։", "Ծառայությունը մատուցվում է վճարումը հաստատվելուց անմիջապես հետո՝ պլանի գործառույթները ակտիվանում են բիզնես հաշվում։"] },
      { title: "3. Փորձաշրջան", items: ["Նոր բիզնեսը ստանում է 14-օրյա անվճար փորձաշրջան։ Փորձաշրջանի ընթացքում գումար չի գանձվում։", "Փորձաշրջանը կարող եք դադարեցնել ցանկացած պահի՝ առանց որևէ վճարի։"] },
      { title: "4. Բաժանորդագրության չեղարկում", items: ["Պլանը կարող եք չեղարկել ցանկացած պահի «Վճարումներ» բաժնից կամ գրելով աջակցությանը։", "Չեղարկումը դադարեցնում է հաջորդ ժամանակահատվածի երկարաձգումը։ Արդեն վճարված ժամանակահատվածի հասանելիությունը պահպանվում է մինչև դրա ավարտը։", "Չեղարկումից հետո հաշիվը և տվյալները պահպանվում են, իսկ վճարովի գործառույթները անջատվում են ժամանակահատվածի ավարտին։"] },
      { title: "5. Երբ է կատարվում գումարի վերադարձ", items: ["Կրկնակի գանձում կամ տեխնիկական սխալով կատարված վճարում՝ վերադարձվում է ամբողջությամբ։", "Եթե վճարումից հետո 14 օրվա ընթացքում պլանի վճարովի գործառույթները չեք օգտագործել, կարող եք պահանջել ամբողջական վերադարձ։", "Եթե ծառայությունը մեր մեղքով անհասանելի է եղել 72 ժամից ավելի, կարող եք պահանջել չօգտագործված ժամանակահատվածի համամասնական վերադարձ։", "Մնացած դեպքերում արդեն սկսված վճարված ժամանակահատվածի համար գումարը չի վերադարձվում, քանի որ թվային ծառայությունն արդեն մատուցվել է։ Սա չի սահմանափակում ՀՀ օրենսդրությամբ սպառողին տրված իրավունքները։"] },
      { title: "6. Ինչպես պահանջել վերադարձ", items: [`Գրեք ${LEGAL_ENTITY.email} հասցեին կամ զանգահարեք ${LEGAL_ENTITY.phone}՝ նշելով բիզնես հաշվի էլ. հասցեն, վճարման ամսաթիվը, գումարը և պատճառը։`, "Դիմումին պատասխանում ենք 3 աշխատանքային օրվա ընթացքում։", "Հաստատված վերադարձը կատարվում է նույն քարտին կամ Idram դրամապանակին, որով կատարվել է վճարումը։ Բանկից կախված՝ գումարը հաշվին է հասնում 5–15 աշխատանքային օրում։"] },
      { title: "7. Բիզնեսների ծառայությունների վճարումներ", items: ["Vizit-ով ամրագրված սրահի, կլինիկայի կամ այլ բիզնեսի ծառայության գինը, կանխավճարը, չեղարկումը և վերադարձը որոշում է տվյալ բիզնեսը։ Այդ պայմանները բիզնեսը ցուցադրում է ամրագրումից առաջ, իսկ վեճերը լուծվում են հաճախորդի և բիզնեսի միջև։"] },
    ],
  },
  ru: {
    title: "Политика отмены и возврата",
    description: "Как отменить подписку Vizit, когда возможен возврат средств и на каких условиях.",
    operatorTitle: "1. К чему относится",
    operatorExtra: "Эта политика относится к платежам за SaaS-тарифы (подписки) Vizit, оплаченным на vizit.am банковской картой или через Idram.",
    sections: [
      { title: "2. Что мы продаём", items: ["Vizit продаёт цифровую услугу — месячный или годовой тариф платформы онлайн-записи и управления бизнесом. Физические товары не доставляются.", "Цены тарифов в армянских драмах, включая применимые налоги, опубликованы на странице /pricing и показываются до оплаты.", "Услуга предоставляется сразу после подтверждения оплаты — функции тарифа активируются в бизнес-аккаунте."] },
      { title: "3. Пробный период", items: ["Новый бизнес получает бесплатный пробный период 14 дней. В течение пробного периода деньги не списываются.", "Пробный период можно прекратить в любой момент без оплаты."] },
      { title: "4. Отмена подписки", items: ["Тариф можно отменить в любой момент в разделе «Оплата» или написав в поддержку.", "Отмена прекращает продление на следующий период. Доступ за уже оплаченный период сохраняется до его окончания.", "После отмены аккаунт и данные сохраняются, а платные функции отключаются в конце периода."] },
      { title: "5. Когда производится возврат", items: ["Двойное списание или платёж, проведённый из-за технической ошибки, — возвращается полностью.", "Если в течение 14 дней после оплаты вы не пользовались платными функциями тарифа, можно запросить полный возврат.", "Если сервис был недоступен по нашей вине более 72 часов, можно запросить пропорциональный возврат за неиспользованный период.", "В остальных случаях оплата за уже начатый период не возвращается, так как цифровая услуга уже предоставлена. Это не ограничивает права потребителя по законодательству РА."] },
      { title: "6. Как запросить возврат", items: [`Напишите на ${LEGAL_ENTITY.email} или позвоните ${LEGAL_ENTITY.phone}, указав e-mail бизнес-аккаунта, дату платежа, сумму и причину.`, "Мы отвечаем на запрос в течение 3 рабочих дней.", "Подтверждённый возврат производится на ту же карту или кошелёк Idram, с которых была оплата. В зависимости от банка деньги поступают за 5–15 рабочих дней."] },
      { title: "7. Оплата услуг бизнесов", items: ["Цену, предоплату, отмену и возврат услуги салона, клиники или другого бизнеса, забронированной через Vizit, определяет сам бизнес. Он показывает эти условия до записи, а споры решаются между клиентом и бизнесом."] },
    ],
  },
  en: {
    title: "Cancellation and refund policy",
    description: "How to cancel a Vizit subscription, when a refund is possible and on what terms.",
    operatorTitle: "1. Scope",
    operatorExtra: "This policy covers payments for Vizit SaaS plans (subscriptions) made on vizit.am by bank card or Idram.",
    sections: [
      { title: "2. What we sell", items: ["Vizit sells a digital service: a monthly or yearly plan for its online booking and business management platform. No physical goods are delivered.", "Plan prices in Armenian dram, including applicable taxes, are published on the /pricing page and shown before payment.", "The service is provided immediately after the payment is confirmed: plan features are activated in the business account."] },
      { title: "3. Trial", items: ["A new business gets a free 14-day trial. Nothing is charged during the trial.", "You can stop the trial at any time without any charge."] },
      { title: "4. Cancelling a subscription", items: ["You can cancel a plan at any time in the Billing section or by writing to support.", "Cancelling stops renewal for the next period. Access for a period already paid continues until it ends.", "After cancellation the account and data are kept, and paid features are switched off at the end of the period."] },
      { title: "5. When we refund", items: ["A duplicate charge or a payment made because of a technical error is refunded in full.", "If you have not used the plan's paid features within 14 days of payment, you can ask for a full refund.", "If the service was unavailable through our fault for more than 72 hours, you can ask for a pro-rata refund of the unused period.", "In other cases a paid period that has already started is not refunded, because the digital service has already been provided. This does not limit consumer rights under Armenian law."] },
      { title: "6. How to request a refund", items: [`Write to ${LEGAL_ENTITY.email} or call ${LEGAL_ENTITY.phone} with the business account email, payment date, amount and reason.`, "We reply within 3 business days.", "An approved refund goes back to the same card or Idram wallet used for the payment. Depending on the bank, it arrives in 5–15 business days."] },
      { title: "7. Payments for business services", items: ["The price, deposit, cancellation and refund of a salon, clinic or other business service booked through Vizit are set by that business. It shows these terms before booking, and disputes are settled between the customer and the business."] },
    ],
  },
} as const;

export default function RefundPolicy() {
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
      content: <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>,
    })),
  ];

  return <LegalPageTemplate title={text.title} description={text.description} updatedAt={LEGAL_DOCUMENT_VERSION} sections={sections} />;
}
