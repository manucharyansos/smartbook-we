import ComingSoonPage from "../components/marketing/ComingSoonPage";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Միացիր Vizit-ի թիմին", description: "Թափուր հաստիքները և համագործակցության հնարավորությունները կհրապարակվեն այս բաժնում։", bullets: ["Այստեղ կհրապարակվեն տեխնիկական, արտադրանքի, աջակցության և աճի ուղղությունների հաստիքները։", "Յուրաքանչյուր հայտարարություն կներկայացնի աշխատանքի ձևաչափը, պահանջներն ու դիմելու ընթացքը։", "Աշխատանքի կամ համագործակցության հետաքրքրության դեպքում արդեն կարող եք գրել կապի էջից։"] },
  ru: { title: "Присоединяйтесь к команде Vizit", description: "В этом разделе будут опубликованы вакансии и возможности сотрудничества.", bullets: ["Здесь появятся вакансии в разработке, продукте, поддержке и развитии.", "В каждом объявлении будут формат работы, требования и порядок отклика.", "Уже сейчас можно написать нам через страницу контактов по поводу работы или сотрудничества."] },
  en: { title: "Join the Vizit team", description: "Open roles and collaboration opportunities will be published here.", bullets: ["Roles in engineering, product, support and growth will be listed here.", "Each listing will explain the working model, requirements and application process.", "You can already contact us about work or collaboration through the contact page."] },
} as const;

export default function Careers() {
  const { locale } = useLanguage();
  const text = copy[locale];
  return (
    <ComingSoonPage
      badge="Careers"
      title={text.title}
      description={text.description}
      bullets={[...text.bullets]}
    />
  );
}
