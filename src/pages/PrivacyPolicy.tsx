import LegalPageTemplate from "../components/marketing/LegalPageTemplate";

const updatedAt = new Date().toISOString().slice(0, 10);

export default function PrivacyPolicy() {
  return (
    <LegalPageTemplate
      title="Գաղտնիության քաղաքականություն"
      description="Ինչ տվյալներ է մշակում SmartBook-ը, ինչ նպատակով և ինչ սահմաններում է դա արվում ծառայությունը կայուն ու անվտանգ պահելու համար։"
      updatedAt={updatedAt}
      sections={[
        {
          title: "1. Ովքեր ենք",
          content: (
            <p>
              SmartBook-ը ամրագրման և scheduling հարթակ է գեղեցկության սրահների, կլինիկաների և
              այլ ծառայողական բիզնեսների համար։
            </p>
          ),
        },
        {
          title: "2. Ինչ տվյալներ կարող ենք հավաքել",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Հաշվի տվյալներ՝ անուն, email, role</li>
              <li>Բիզնեսի տվյալներ՝ անվանում, հասցե, հեռախոս, աշխատանքային ժամեր</li>
              <li>Booking տվյալներ՝ ծառայություն, staff, ժամանակ, հաճախորդի անուն/հեռախոս</li>
              <li>Տեխնիկական տվյալներ՝ IP, browser/device meta, անվտանգության log-եր</li>
            </ul>
          ),
        },
        {
          title: "3. Ինչ նպատակով ենք օգտագործում",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Ծառայության տրամադրում՝ public booking, calendar, staff և settings</li>
              <li>Անվտանգություն և չարաշահման կանխարգելում</li>
              <li>Support և հարցումների պատասխան</li>
              <li>Արտադրանքի բարելավում՝ սահմանափակ analytics/usage insight-ներով</li>
            </ul>
          ),
        },
        {
          title: "4. Տվյալների փոխանցում և կիսում",
          content: (
            <p>
              Մենք չենք վաճառում օգտատերերի տվյալները։ Տվյալները կարող են մշակվել միայն hosting,
              infrastructure կամ օրենքով պարտադիր պահանջների շրջանակում։
            </p>
          ),
        },
        {
          title: "5. Պահպանման ժամկետ",
          content: (
            <p>
              Տվյալները պահվում են այնքան, որքան անհրաժեշտ է ծառայության տրամադրման, հաշվետվողականության
              և օրինական պահանջների կատարման համար։
            </p>
          ),
        },
        {
          title: "6. Ձեր իրավունքները",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Ստանալ ձեր տվյալների պատճենը</li>
              <li>Թարմացնել կամ ուղղել տվյալները</li>
              <li>Պահանջել ջնջում՝ օրենքով թույլատրելի սահմաններում</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
