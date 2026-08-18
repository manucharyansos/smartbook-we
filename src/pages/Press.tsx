import ComingSoonPage from "../components/marketing/ComingSoonPage";
import { useLanguage } from "../contexts/LanguageContext";

const copy = {
  hy: { title: "Մամուլի և մեդիա նյութերի կենտրոն", description: "Այս բաժնում կհավաքվեն Vizit-ի պաշտոնական նկարագրությունն ու բրենդային նյութերը։", bullets: ["Բրենդային նյութեր, տարբերանշանի փաթեթ և մամուլի համար պատրաստ նկարագրություններ։", "Արտադրանքի պատկերներ և ընկերության կարճ ներկայացում գործընկերների ու լրատվամիջոցների համար։", "Մամուլի հարցումների համար այժմ կարող եք կապվել մեզ հետ կապի կամ աջակցության էջերից։"] },
  ru: { title: "Центр материалов для прессы и медиа", description: "Здесь будут собраны официальное описание Vizit и фирменные материалы.", bullets: ["Фирменные материалы, пакет логотипов и готовые описания для прессы.", "Скриншоты продукта и краткий профиль компании для партнёров и СМИ.", "По вопросам прессы уже сейчас можно написать нам через страницы контактов или поддержки."] },
  en: { title: "Press and media centre", description: "Vizit's official description and brand materials will be collected here.", bullets: ["Brand assets, a logo pack and media-ready descriptions.", "Product screenshots and a short company profile for partners and the press.", "For press enquiries, you can contact us now through the contact or support pages."] },
} as const;

export default function Press() {
  const { locale } = useLanguage();
  const text = copy[locale];
  return (
    <ComingSoonPage
      badge="Press & Media"
      title={text.title}
      description={text.description}
      bullets={[...text.bullets]}
    />
  );
}
