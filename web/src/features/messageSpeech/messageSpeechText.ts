import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false, linkify: false, breaks: true });
type Token = ReturnType<MarkdownIt["parse"]>[number];

function inlineText(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === "text" || token.type === "code_inline") return token.content;
      if (token.type === "softbreak" || token.type === "hardbreak") return "\n";
      if (token.type === "image" || token.type === "html_inline") return "";
      return token.children ? inlineText(token.children) : "";
    })
    .join("");
}

export function messageSpeechText(source: string): string {
  const tokens = markdown.parse(source.replace(/<!--[\s\S]*?-->/g, ""), {});
  const output: string[] = [];
  for (const token of tokens) {
    if (token.type === "inline") output.push(inlineText(token.children || []));
    else if (
      ["paragraph_close", "heading_close", "list_item_close", "tr_close", "hr"].includes(token.type)
    )
      output.push("\n");
    else if (token.type === "td_close" || token.type === "th_close") output.push(" ");
  }
  return output
    .join("")
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitSpeechText(text: string, maxLength = 160): string[] {
  const limit = Math.max(20, Math.floor(maxLength));
  const sentences = text.match(/[^。！？!?；;\n]+[。！？!?；;\n]*/gu) || [];
  const chunks: string[] = [];
  for (const sentence of sentences) {
    let chars = Array.from(sentence.trim());
    while (chars.length > limit) {
      let end = limit;
      for (let index = limit - 1; index >= Math.floor(limit / 2); index--) {
        if (/[\s，,、：:]/u.test(chars[index])) {
          end = index + 1;
          break;
        }
      }
      const chunk = chars.slice(0, end).join("").trim();
      if (chunk) chunks.push(chunk);
      chars = chars.slice(end);
    }
    const rest = chars.join("").trim();
    if (rest) chunks.push(rest);
  }
  return chunks;
}

export function messageSpeechLanguage(text: string, language: string): string {
  if (/[\u3040-\u30ff]/u.test(text)) return "ja-JP";
  if (/[\uac00-\ud7af]/u.test(text)) return "ko-KR";
  if (/\p{Script=Han}/u.test(text)) return /^zh-(TW|HK|Hant)/i.test(language) ? "zh-TW" : "zh-CN";
  return /^(zh|ja|ko)(-|$)/i.test(language) ? "en-US" : language || "en-US";
}
