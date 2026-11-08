import {
  codexMessageSpeechAvailable,
  createCodexMessageSpeechSession,
} from "./codexMessageSpeechSession";
import {
  messageSpeechError,
  type MessageSpeechError,
  type MessageSpeechFactory,
  type MessageSpeechPhase,
  type MessageSpeechSession,
} from "./messageSpeechTypes";

export const messageSpeechAvailable = codexMessageSpeechAvailable;
type Snapshot = { key: string; phase: MessageSpeechPhase };
type ActiveSession = { key: string; session: MessageSpeechSession };

export function createMessageSpeechController(
  factory: MessageSpeechFactory = createCodexMessageSpeechSession,
) {
  let current: ActiveSession | null = null;
  let snapshot: Snapshot | null = null;
  let cleanup: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const stop = (key?: string): Promise<void> => {
    if (!current || (key !== undefined && current.key !== key)) return cleanup;
    const previous = current;
    current = null;
    snapshot = null;
    if (typeof window !== "undefined") window.removeEventListener("pagehide", stopOnPageHide);
    notify();
    let stopping: Promise<void>;
    try {
      stopping = previous.session.stop();
    } catch {
      stopping = Promise.resolve();
    }
    cleanup = Promise.allSettled([cleanup, stopping]).then(() => {});
    return cleanup;
  };
  const stopOnPageHide = () => {
    void stop();
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getActiveKey: () => current?.key ?? null,
    getSnapshot: () => snapshot,
    stop,
    toggle(
      key: string,
      text: string,
      language: string,
      onError: (error: MessageSpeechError) => void = () => {},
    ) {
      if (current?.key === key) {
        void stop();
        return;
      }
      void stop();
      if (!text.trim()) return;
      let active: ActiveSession;
      const failed = (error: MessageSpeechError) => {
        if (current !== active) return;
        void stop();
        onError(error);
      };
      try {
        const session = factory(text, language, {
          onPhase: (phase) => {
            if (current === active) {
              snapshot = { key, phase };
              notify();
            }
          },
          onEnd: () => {
            if (current === active) void stop();
          },
          onError: failed,
        });
        active = { key, session };
      } catch (error) {
        onError(messageSpeechError(error));
        return;
      }
      current = active;
      snapshot = { key, phase: "connecting" };
      if (typeof window !== "undefined") window.addEventListener("pagehide", stopOnPageHide);
      notify();
      void cleanup
        .then(() => {
          if (current === active) return active.session.start();
        })
        .catch((error: unknown) => failed(messageSpeechError(error)));
    },
  };
}
export const messageSpeech = createMessageSpeechController();
