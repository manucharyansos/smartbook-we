import LegalPageTemplate from "../components/marketing/LegalPageTemplate";

const updatedAt = new Date().toISOString().slice(0, 10);

export default function Cookies() {
  return (
    <LegalPageTemplate
      title="Cookie Policy"
      description="Ինչ cookies ենք օգտագործում, ինչ նպատակով և ինչպես են դրանք օգնում Vizit-ի հիմնական ֆունկցիոնալին։"
      updatedAt={updatedAt}
      sections={[
        {
          title: "1. Ինչ են cookies-ը",
          content: (
            <p>
              Cookies-ը փոքր տեքստային ֆայլեր են, որոնք պահվում են բրաուզերում և օգնում են
              պահպանել սեսիան, նախընտրությունները և ծառայության կայուն աշխատանքը։
            </p>
          ),
        },
        {
          title: "2. Ինչ տեսակ cookies կարող ենք օգտագործել",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Auth / session cookies՝ մուտքի և սեսիայի պահպանման համար</li>
              <li>Security cookies՝ CSRF, request validation և անվտանգ աշխատանքի համար</li>
              <li>Preference cookies՝ ապագա լեզվի կամ UI preference-ների համար</li>
            </ul>
          ),
        },
        {
          title: "3. Ինչ չենք անում",
          content: (
            <p>
              Այս պահին advertising-heavy կամ third-party tracking cookies չենք նախատեսում որպես
              core product behavior։ Եթե այդ քաղաքականությունը փոխվի, էջը նույնպես կթարմացվի։
            </p>
          ),
        },
        {
          title: "4. Կառավարում",
          content: (
            <p>
              Կարող եք ձեր բրաուզերում արգելափակել կամ ջնջել cookies-ը, սակայն դա կարող է ազդել
              մուտքի, անվտանգության կամ որոշ կարևոր UI flows-ի վրա։
            </p>
          ),
        },
      ]}
    />
  );
}
