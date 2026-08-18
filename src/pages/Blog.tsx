import ComingSoonPage from "../components/marketing/ComingSoonPage";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Հոդվածներ բիզնեսի աճի, ամրագրման և հաճախորդների փորձի մասին", description: "Այստեղ կհրապարակվեն գործնական հոդվածներ՝ ամրագրումների, հաճախորդների փորձի և բիզնեսի աճի մասին։", bullets: ["Աճի գաղափարներ ծառայությունների և բժշկական բիզնեսների համար։", "Նյութեր հանրային ամրագրման արդյունավետության, հաճախորդների պահպանման և թիմի աշխատանքի մասին։", "Արտադրանքի նորություններ և մեկնարկային ուղեցույցներ։"] },
  ru: { title: "Статьи о росте бизнеса, записи и клиентском опыте", description: "Здесь появятся практические статьи об онлайн-записи, клиентском опыте и развитии бизнеса.", bullets: ["Идеи роста для сервисных и медицинских бизнесов.", "Материалы об эффективности публичной записи, удержании клиентов и работе команды.", "Новости продукта и руководства по запуску."] },
  en: { title: "Articles about business growth, booking and customer experience", description: "Practical articles about booking, customer experience and business growth will be published here.", bullets: ["Growth ideas for service and healthcare businesses.", "Guides to public-booking conversion, retention and team operations.", "Product news and getting-started guides."] },
} as const;

export default function Blog() {
  const { locale } = useLanguage();
  const text = copy[locale];
  return (
    <ComingSoonPage
      badge="Vizit Blog"
      title={text.title}
      description={text.description}
      bullets={[...text.bullets]}
    />
  );
}
