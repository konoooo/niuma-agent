import { expect, it } from "vite-plus/test";
import { messageSpeechLanguage, messageSpeechText, splitSpeechText } from "./messageSpeechText";

it("提取 Markdown 正文，保留链接文字和行内代码，跳过代码块与图片", () => {
  const source =
    "# 标题\n\n**你好**，阅读[文档](https://example.com)，运行 `npm test`。\n\n```ts\nsecret();\n```\n\n![不朗读图片](https://example.com/a.png)\n\n<!-- 内部注释 -->\n结束。";
  expect(messageSpeechText(source).split(/\n+/)).toEqual([
    "标题",
    "你好，阅读文档，运行 npm test。",
    "结束。",
  ]);
  expect(messageSpeechText("    隐藏的缩进代码\n")).toBe("");
});

it("表格和列表按可读文字分隔，实体字符还原", () => {
  expect(
    messageSpeechText(
      "| 名字 | 状态 |\n| --- | --- |\n| 成员 | 工作中 |\n\n- A &amp; B\n- 第二项",
    ).split(/\n+/),
  ).toEqual(["名字 状态", "成员 工作中", "A & B", "第二项"]);
});

it("长文本按语句和长度拆分，保留全部文字与完整 Unicode 字符", () => {
  const text = `${"这是一段长文字🌱，".repeat(45)}完成。下一句！`;
  const chunks = splitSpeechText(text, 80);
  expect(chunks.length).toBeGreaterThan(2);
  expect(chunks.every((chunk) => Array.from(chunk).length <= 80)).toBe(true);
  expect(chunks.join("").replace(/\s/g, "")).toBe(text.replace(/\s/g, ""));
  expect(chunks.at(-1)).toBe("下一句！");
});

it("中文正文选择中文语言，纯英文正文不会被界面中文设置强制使用中文声音", () => {
  expect(messageSpeechLanguage("你好", "en")).toBe("zh-CN");
  expect(messageSpeechLanguage("你好", "zh-TW")).toBe("zh-TW");
  expect(messageSpeechLanguage("Hello", "zh")).toBe("en-US");
  expect(messageSpeechLanguage("こんにちは", "zh")).toBe("ja-JP");
});
