import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

const copy = {
  hy: {
    title: "Էջը չհաջողվեց բացել",
    text: "Թարմացրեք էջը։ Եթե խնդիրը կրկնվի, վերադարձեք գլխավոր էջ և փորձեք կրկին։",
    reload: "Թարմացնել",
    home: "Գլխավոր էջ",
  },
  ru: {
    title: "Не удалось открыть страницу",
    text: "Обновите страницу. Если ошибка повторится, вернитесь на главную и попробуйте снова.",
    reload: "Обновить",
    home: "На главную",
  },
  en: {
    title: "The page could not be opened",
    text: "Reload the page. If the issue continues, return home and try again.",
    reload: "Reload",
    home: "Home",
  },
} as const;

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Vizit render failure", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const language = document.documentElement.lang;
    const text = copy[language === "ru" || language === "en" ? language : "hy"];

    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-white">
        <section role="alert" className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-7 text-center shadow-2xl backdrop-blur sm:p-9">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-2xl" aria-hidden="true">!</div>
          <h1 className="mt-5 text-2xl font-semibold">{text.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/70">{text.text}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-violet-600 px-5 text-sm font-medium transition hover:bg-violet-500">{text.reload}</button>
            <a href="/" className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 px-5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white">{text.home}</a>
          </div>
        </section>
      </main>
    );
  }
}
