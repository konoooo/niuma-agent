export type MessageSpeechPhase = "connecting" | "reading";
export type MessageSpeechError =
  | "unavailable"
  | "failed"
  | "busy"
  | "login"
  | "readOnly"
  | "playbackBlocked";
export type MessageSpeechCallbacks = {
  onPhase(phase: MessageSpeechPhase): void;
  onEnd(): void;
  onError(error: MessageSpeechError): void;
};
export type MessageSpeechSession = { start(): Promise<void>; stop(): Promise<void> };
export type MessageSpeechFactory = (
  text: string,
  language: string,
  callbacks: MessageSpeechCallbacks,
) => MessageSpeechSession;

export function messageSpeechError(error: unknown): MessageSpeechError {
  const code = error instanceof Error ? error.message : "";
  if (code === "codex_voice_busy") return "busy";
  if (/credentials|auth_failed/.test(code)) return "login";
  if (code === "read_only") return "readOnly";
  if (code === "unavailable" || code === "playbackBlocked") return code;
  return "failed";
}
