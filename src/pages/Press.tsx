import ComingSoonPage from "../components/marketing/ComingSoonPage";

export default function Press() {
  return (
    <ComingSoonPage
      badge="Press & Media"
      title="Մամուլի և մեդիա նյութերի կենտրոն"
      description="Մամուլի համար առանձին բաժինը դեռ համալրման փուլում է, բայց էջը արդեն նույն public design language-ի մեջ է, որպեսզի մնացած կայքից կտրված չթվա։"
      bullets={[
        "Այստեղ կհավաքվեն brand assets, logo pack և media-ready նկարագրությունները։",
        "Կավելացվեն product screenshots և short company profile-ը գործընկերների կամ մամուլի համար։",
        "Մինչ այդ մամուլի հարցումների համար ավելի ճիշտ է կապվել contact/support էջերով։",
      ]}
    />
  );
}
