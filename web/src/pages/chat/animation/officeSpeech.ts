import type { OfficeUtterance } from "./officeEvents";

export type OfficeSpeechClock = { allowedAt: number; fallbackAt: number; lastUtteranceId: string };
type SpeechView = { working: boolean; hint: string; utterance: OfficeUtterance | null };
type Speech = { text: string; source: "actual" | "status" };

export function planOfficeSpeech(
  view: SpeechView,
  previous: OfficeSpeechClock | null,
  now: number,
  index: number,
): { clock: OfficeSpeechClock | null; speech: Speech | null } {
  if (!view.working) return { clock: null, speech: null };
  const offset = Math.max(0, Math.min(5, Math.floor(index))) * 3_000;
  const clock = previous || {
    allowedAt: now,
    fallbackAt: now + 8_000 + offset,
    lastUtteranceId: "",
  };
  if (now < clock.allowedAt) return { clock, speech: null };
  const utterance = view.utterance;
  const fresh =
    utterance &&
    utterance.id !== clock.lastUtteranceId &&
    now >= utterance.receivedAt &&
    now - utterance.receivedAt <= 15_000 &&
    utterance.text.trim();
  if (fresh && utterance) {
    return {
      clock: {
        allowedAt: now + 8_000,
        fallbackAt: now + 35_000 + offset,
        lastUtteranceId: utterance.id,
      },
      speech: { text: utterance.text, source: "actual" },
    };
  }
  if (now >= clock.fallbackAt && view.hint.trim()) {
    return {
      clock: { ...clock, allowedAt: now + 8_000, fallbackAt: now + 35_000 + offset },
      speech: { text: view.hint, source: "status" },
    };
  }
  return { clock, speech: null };
}
