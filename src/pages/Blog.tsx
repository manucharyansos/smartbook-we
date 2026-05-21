import ComingSoonPage from "../components/marketing/ComingSoonPage";

export default function Blog() {
  return (
    <ComingSoonPage
      badge="Vizit Blog"
      title="Հոդվածներ բիզնեսի աճի, booking flow-ի և հաճախորդների փորձի մասին"
      description="Այս բաժինը դեռ լրացվում է, բայց արդեն բերվել է ընդհանուր premium public design-ի տակ, որպեսզի կայքը տեսողականորեն ամբողջական լինի։"
      bullets={[
        "Գրելու ենք growth գաղափարներ գեղեցկության սրահների և ատամնաբուժական կլինիկաների համար։",
        "Կլինեն նյութեր public booking page conversion-ի, retention-ի և staff operations-ի մասին։",
        "Հետագայում այստեղից կարելի կլինի նաև share անել product update-երը և onboarding ուղեցույցները։",
      ]}
    />
  );
}
