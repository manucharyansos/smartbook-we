import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Send, Unplug } from "lucide-react";
import { useState } from "react";

import { useLanguage, type Locale } from "../contexts/LanguageContext";
import { cn } from "../lib/cn";
import {
  createTelegramConnectionLink,
  disconnectTelegram,
  fetchTelegramConnection,
} from "../lib/telegramApi";

const telegramCopy = {
  hy: {
    title: "Telegram ծանուցումներ",
    description: "Ստացեք ձեր դերին վերաբերող նոր, տեղափոխված և չեղարկված ամրագրումները Telegram-ում։",
    startHint: "Բոտը բացելուց հետո սեղմեք Start / Սկսել։",
    connected: "Բոտը միացված է",
    connectedHint: "Ծանուցումները կգան այս Telegram հաշվին։",
    connect: "Միացնել Telegram-ը",
    connecting: "Բացում ենք բոտը…",
    disconnect: "Անջատել",
    disconnecting: "Անջատվում է…",
    unavailable: "Telegram բոտը դեռ կարգավորված չէ սերվերում։",
    loadError: "Չհաջողվեց ստուգել Telegram կապը։",
    connectError: "Չհաջողվեց ստեղծել Telegram-ի միացման հղումը։",
    disconnectError: "Չհաջողվեց անջատել Telegram-ը։",
  },
  ru: {
    title: "Уведомления Telegram",
    description: "Получайте в Telegram новые, перенесённые и отменённые записи, относящиеся к вашей роли.",
    startHint: "После открытия бота нажмите Start / Запустить.",
    connected: "Бот подключён",
    connectedHint: "Уведомления будут приходить в этот аккаунт Telegram.",
    connect: "Подключить Telegram",
    connecting: "Открываем бота…",
    disconnect: "Отключить",
    disconnecting: "Отключаем…",
    unavailable: "Telegram-бот ещё не настроен на сервере.",
    loadError: "Не удалось проверить подключение Telegram.",
    connectError: "Не удалось создать ссылку подключения Telegram.",
    disconnectError: "Не удалось отключить Telegram.",
  },
  en: {
    title: "Telegram notifications",
    description: "Receive new, rescheduled and cancelled bookings relevant to your role in Telegram.",
    startHint: "After the bot opens, tap Start.",
    connected: "Bot connected",
    connectedHint: "Notifications will arrive in this Telegram account.",
    connect: "Connect Telegram",
    connecting: "Opening bot…",
    disconnect: "Disconnect",
    disconnecting: "Disconnecting…",
    unavailable: "The Telegram bot is not configured on the server yet.",
    loadError: "Could not check the Telegram connection.",
    connectError: "Could not create the Telegram connection link.",
    disconnectError: "Could not disconnect Telegram.",
  },
} satisfies Record<Locale, Record<string, string>>;

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export function TelegramConnectionCard({
  className,
  variant = "sidebar",
}: {
  className?: string;
  variant?: "sidebar" | "settings" | "drawer";
}) {
  const { locale } = useLanguage();
  const text = telegramCopy[locale];
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const isSettings = variant === "settings";

  const connectionQ = useQuery({
    queryKey: ["telegram-connection"],
    queryFn: fetchTelegramConnection,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const connectMut = useMutation({
    mutationFn: createTelegramConnectionLink,
    onSuccess: (connection) => {
      setActionError(null);
      window.location.assign(connection.url);
    },
    onError: (error: unknown) => {
      setActionError(apiErrorMessage(error, text.connectError));
    },
  });

  const disconnectMut = useMutation({
    mutationFn: disconnectTelegram,
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["telegram-connection"] });
    },
    onError: (error: unknown) => {
      setActionError(apiErrorMessage(error, text.disconnectError));
    },
  });

  const connected = Boolean(connectionQ.data?.connected);
  const unavailable = Boolean(connectionQ.data && !connectionQ.data.available && !connected);
  const busy = connectionQ.isLoading || connectMut.isPending || disconnectMut.isPending;

  return (
    <section
      className={cn(
        "rounded-[22px] border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-white text-slate-900 shadow-[0_12px_30px_rgba(14,165,233,0.08)] dark:border-sky-400/15 dark:from-sky-950/35 dark:via-slate-900 dark:to-slate-900 dark:text-white",
        isSettings ? "p-4 sm:flex sm:items-center sm:justify-between sm:gap-5" : "p-3.5",
        variant === "drawer" && "rounded-2xl shadow-none",
        className,
      )}
      aria-labelledby={`telegram-connection-title-${variant}`}
    >
      <div className={cn("flex min-w-0 items-start gap-3", isSettings && "sm:flex-1")}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-500 text-white shadow-sm" aria-hidden="true">
          <Send className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <h3 id={`telegram-connection-title-${variant}`} className="text-sm font-bold text-slate-950 dark:text-white">
            {text.title}
          </h3>
          <p className={cn("mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300", !isSettings && "line-clamp-3")}>
            {connected ? text.connectedHint : text.description}
          </p>
          {!connected && !unavailable ? (
            <p className="mt-1 text-[11px] font-semibold leading-4 text-sky-700 dark:text-sky-300">{text.startHint}</p>
          ) : null}
        </div>
      </div>

      <div className={cn("mt-3", isSettings && "sm:mt-0 sm:shrink-0")} aria-live="polite">
        {connectionQ.isError ? (
          <p className="text-xs font-semibold leading-5 text-rose-700 dark:text-rose-300">{text.loadError}</p>
        ) : null}
        {unavailable ? (
          <p className="text-xs font-semibold leading-5 text-amber-700 dark:text-amber-300">{text.unavailable}</p>
        ) : null}

        {!connectionQ.isError && !unavailable ? (
          connected ? (
            <div className={cn("flex flex-wrap items-center gap-2", !isSettings && "justify-between")}>
              <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {text.connected}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => disconnectMut.mutate()}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/[0.1]"
              >
                {disconnectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Unplug className="h-4 w-4" aria-hidden="true" />}
                {disconnectMut.isPending ? text.disconnecting : text.disconnect}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy || !connectionQ.data?.available}
              onClick={() => connectMut.mutate()}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-3 text-xs font-black text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {busy ? text.connecting : text.connect}
            </button>
          )
        ) : null}

        {actionError ? <p className="mt-2 text-xs font-semibold leading-5 text-rose-700 dark:text-rose-300">{actionError}</p> : null}
      </div>
    </section>
  );
}
