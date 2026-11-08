import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { RefreshIcon, StopIcon, VolumeIcon } from "../../components/Icons";
import { useUIStore } from "../../stores/useUIStore";
import { messageSpeech, messageSpeechAvailable } from "./messageSpeech";
import { messageSpeechLanguage, messageSpeechText } from "./messageSpeechText";
import "./messageSpeech.css";

export function MessageReadAloudButton({
  groupId,
  messageId,
  text,
  readOnly = false,
}: {
  groupId: string;
  messageId: string;
  text: string;
  readOnly?: boolean;
}) {
  const { t, i18n } = useTranslation("chat");
  const showNotice = useUIStore((state) => state.showNotice);
  const readable = useMemo(() => messageSpeechText(text), [text]);
  const key = JSON.stringify([groupId, messageId]);
  const playback = useSyncExternalStore(
    messageSpeech.subscribe,
    messageSpeech.getSnapshot,
    () => null,
  );
  const active = playback?.key === key;
  const connecting = active && playback.phase === "connecting";
  const available = !readOnly && messageSpeechAvailable();
  useEffect(
    () => () => {
      void messageSpeech.stop(key);
    },
    [key, readable, readOnly],
  );
  if (!readable) return null;
  const label = t(
    readOnly
      ? "messageSpeech.readOnly"
      : !available
        ? "messageSpeech.unavailable"
        : connecting
          ? "messageSpeech.connecting"
          : active
            ? "messageSpeech.stop"
            : "messageSpeech.read",
  );
  return (
    <button
      type="button"
      className="message-read-aloud"
      data-message-read-aloud={messageId}
      aria-label={label}
      title={label}
      aria-pressed={active}
      aria-busy={connecting || undefined}
      disabled={!available}
      onClick={() =>
        messageSpeech.toggle(
          key,
          readable,
          messageSpeechLanguage(readable, i18n?.resolvedLanguage || navigator.language),
          (error) => showNotice({ message: t(`messageSpeech.${error}`) }),
        )
      }
    >
      {connecting ? (
        <RefreshIcon size={14} className="message-read-aloud-loading" aria-hidden="true" />
      ) : active ? (
        <StopIcon size={14} aria-hidden="true" />
      ) : (
        <VolumeIcon size={14} aria-hidden="true" />
      )}
    </button>
  );
}
