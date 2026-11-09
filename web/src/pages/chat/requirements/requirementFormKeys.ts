import type { KeyboardEvent } from "react";
import { insertTextareaNewline, isComposingKey, isPlainEnter } from "../../../utils/textareaSubmit";

export function submitRequirementOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== "Enter" || isComposingKey(event)) return;
  const input = event.currentTarget;
  if (event.metaKey || event.ctrlKey) {
    insertTextareaNewline(event, (value) => {
      input.value = value;
    });
  } else if (isPlainEnter(event)) {
    event.preventDefault();
    if (!event.repeat) input.form?.requestSubmit();
  }
}
