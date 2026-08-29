import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, MailX } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useLanguage } from "../contexts/LanguageContext";
import { unsubscribeMarketing } from "../lib/growthApi";

const copy = {
  hy: { title: "Դադարեցնել marketing նամակները", text: "Այս գործողությունից հետո տվյալ բիզնեսից այլևս marketing email-ներ չեք ստանա։", action: "Ապաբաժանորդագրվել", done: "Դուք հաջողությամբ ապաբաժանորդագրվեցիք։", invalid: "Հղումը սխալ է կամ ժամկետանց։", home: "Գլխավոր էջ" },
  ru: { title: "Отписаться от маркетинговых писем", text: "После этого вы больше не будете получать маркетинговые email от этой компании.", action: "Отписаться", done: "Вы успешно отписались.", invalid: "Ссылка недействительна или устарела.", home: "На главную" },
  en: { title: "Unsubscribe from marketing emails", text: "You will no longer receive marketing email from this business.", action: "Unsubscribe", done: "You have been successfully unsubscribed.", invalid: "This link is invalid or expired.", home: "Home" },
} as const;

export default function MarketingUnsubscribe() {
  const { locale } = useLanguage();
  const text = copy[locale];
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const delivery = Number(params.get("delivery") || 0);
  const token = params.get("token") || "";
  const mutation = useMutation({
    mutationFn: () => unsubscribeMarketing(delivery, token),
    onSuccess: () => setDone(true),
  });
  const invalid = !delivery || !token;

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4">
      <Card className="w-full max-w-lg border border-violet-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-700">{done ? <CheckCircle2 className="h-7 w-7" /> : <MailX className="h-7 w-7" />}</div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">{done ? text.done : text.title}</h1>
        {!done ? <p className="mt-3 text-sm leading-6 text-slate-600">{invalid ? text.invalid : text.text}</p> : null}
        {!done && !invalid ? <Button className="mt-6 w-full" loading={mutation.isPending} onClick={() => mutation.mutate()}>{text.action}</Button> : null}
        {mutation.isError ? <p className="mt-4 text-sm text-rose-600">{text.invalid}</p> : null}
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-violet-700 hover:underline">{text.home}</Link>
      </Card>
    </main>
  );
}
