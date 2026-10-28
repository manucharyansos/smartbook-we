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
    shortDescription: "Ամրագրումների ծանուցումները՝ Telegram-ում։",
    startHint: "Բոտը բացելուց հետո սեղմեք Start / Սկսել։",
    shortStartHint: "Բոտում սեղմեք Start / Սկսել։",
    checking: "Ստուգում ենք կապը…",
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
    shortDescription: "Уведомления о записях в Telegram.",
    startHint: "После открытия бота нажмите Start / Запустить.",
    shortStartHint: "В боте нажмите Start / Запустить.",
    checking: "Проверяем подключение…",
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
    shortDescription: "Booking notifications in Telegram.",
    startHint: "After the bot opens, tap Start.",
    shortStartHint: "Tap Start in the bot.",
    checking: "Checking connection…",
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
        "min-w-0 rounded-[22px] border border-[var(--vz-line)] bg-[var(--vz-surface)] p-4 text-[var(--vz-text)] shadow-[var(--vz-shadow-sm)]",
        isSettings && "sm:flex sm:items-center sm:justify-between sm:gap-5",
        variant === "drawer" && "rounded-2xl shadow-none",
        className,
      )}
      aria-labelledby={`telegram-connection-title-${variant}`}
      data-telegram-variant={variant}
    >
      <div className={cn("min-w-0", isSettings && "sm:flex-1")}>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--vz-accent-soft)] text-[var(--vz-brand-text)]" aria-hidden="true">
            <Send className="h-[18px] w-[18px]" />
          </span>
          <h3 id={`telegram-connection-title-${variant}`} className="min-w-0 text-sm font-semibold leading-5 text-[var(--vz-text)]">
            {text.title}
          </h3>
        </div>
        <p className="mt-2.5 text-xs leading-5 text-[var(--vz-text-secondary)]">
          {connected ? text.connectedHint : isSettings ? text.description : text.shortDescription}
        </p>
      </div>

      <div className={cn("mt-3", isSettings && "sm:mt-0 sm:shrink-0")} aria-live="polite">
        {connectionQ.isError ? (
          <p className="text-xs font-medium leading-5 text-[var(--vz-danger)]">{text.loadError}</p>
        ) : null}
        {unavailable ? (
          <p className="text-xs font-medium leading-5 text-[var(--vz-warning)]">{text.unavailable}</p>
        ) : null}

        {!connectionQ.isError && !unavailable ? (
          connected ? (
            <div className={cn("flex flex-wrap items-center gap-2", !isSettings && "justify-between")}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold leading-5 text-[var(--vz-success)]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {text.connected}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => disconnectMut.mutate()}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--vz-line)] bg-[var(--vz-surface)] px-3 text-xs font-semibold text-[var(--vz-text-secondary)] transition hover:bg-[var(--vz-surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vz-primary)] disabled:cursor-not-allowed disabled:opacity-60"
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
              className={cn("inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--vz-line-strong)] bg-[var(--vz-accent-soft)] px-3 py-2 text-xs font-semibold leading-5 text-[var(--vz-brand-text)] transition hover:border-[var(--vz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vz-primary)] disabled:cursor-not-allowed disabled:opacity-60", isSettings && "sm:w-auto")}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {connectionQ.isLoading ? text.checking : connectMut.isPending ? text.connecting : text.connect}
            </button>
          )
        ) : null}

        {!connected && !unavailable && !connectionQ.isError && !connectionQ.isLoading ? (
          <p className="mt-2 text-[11px] leading-4 text-[var(--vz-muted)]">{isSettings ? text.startHint : text.shortStartHint}</p>
        ) : null}

        {actionError ? <p className="mt-2 text-xs font-semibold leading-5 text-[var(--vz-danger)] dark:text-rose-300">{actionError}</p> : null}
      </div>
    </section>
  );
}
