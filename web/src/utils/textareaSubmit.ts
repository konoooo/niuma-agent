import type { KeyboardEvent } from "react";

export function isComposingKey(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
  const native = event.nativeEvent as globalThis.KeyboardEvent & { keyCode?: number };
  return native.isComposing || native.keyCode === 229;
}

export function insertTextareaNewline(
  event: KeyboardEvent<HTMLTextAreaElement>,
  update: (value: string, caret: number) => void,
): void {
  event.preventDefault();
  const input = event.currentTarget;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = `${input.value.slice(0, start)}\n${input.value.slice(end)}`;
  const caret = start + 1;
  update(value, caret);
  requestAnimationFrame(() => {
    if (input.isConnected && input.value === value) input.setSelectionRange(caret, caret);
  });
}

export function isPlainEnter(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return (
    event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
  );
}
