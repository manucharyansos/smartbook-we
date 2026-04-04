import ComingSoonPage from "../components/marketing/ComingSoonPage";

export default function Careers() {
  return (
    <ComingSoonPage
      badge="Careers"
      title="Միացիր SmartBook-ի թիմին"
      description="Բաց հաստիքների բաժինը դեռ կառուցման փուլում է, բայց էջը բերել եմ նույն premium public style-ին, որ ամբողջ marketing մասը լինի մեկ միասնական համակարգ։"
      bullets={[
        "Ապագայում այստեղ կհրապարակվեն engineering, product, support և growth ուղղությունների հաստիքները։",
        "Բաժինը նաև կունենա աշխատանքի ձևաչափ, պահանջներ և արագ դիմելու հոսք։",
        "Մինչ այդ՝ համագործակցության կամ աշխատանքի հետաքրքրության դեպքում կարող եք գրել contact էջից։",
      ]}
    />
  );
}
