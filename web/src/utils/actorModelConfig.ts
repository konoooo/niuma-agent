import type { ActorModelConfig } from "../types";

export function actorModelConfigsEqual(a?: ActorModelConfig | null, b?: ActorModelConfig | null) {
  const left = a && (a.model || a.reasoning_effort) ? a : null;
  const right = b && (b.model || b.reasoning_effort) ? b : null;
  return (
    left?.runtime === right?.runtime &&
    left?.model === right?.model &&
    left?.reasoning_effort === right?.reasoning_effort
  );
}
