// @vitest-environment happy-dom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { ActorModelConfigFields } from "./ActorModelConfigFields";
import type { ActorModelConfig } from "../../types";
import * as api from "../../services/api";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("../../services/api", () => ({ fetchActorModels: vi.fn() }));
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.mocked(api.fetchActorModels).mockResolvedValue({
    ok: true,
    result: { models: [], available: false },
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("相同配置不因服务端 JSON 键顺序不同而显示待应用", async () => {
  const value: ActorModelConfig = {
    runtime: "codex",
    model: "test-model",
    reasoning_effort: "high",
  };
  const effective = JSON.parse(
    '{"model":"test-model","reasoning_effort":"high","runtime":"codex"}',
  ) as ActorModelConfig;
  await act(async () =>
    root.render(
      <ActorModelConfigFields
        runtime="codex"
        value={value}
        effective={effective}
        running
        onChange={vi.fn()}
      />,
    ),
  );
  expect(host.textContent).not.toContain("modelSettings.pending");
});

it("使用原生模型目录限制可选思考强度", async () => {
  vi.mocked(api.fetchActorModels).mockResolvedValue({
    ok: true,
    result: {
      available: true,
      models: [{ id: "test-model", name: "测试模型", reasoning_efforts: ["low", "high"] }],
    },
  });
  await act(async () =>
    root.render(
      <ActorModelConfigFields
        runtime="codex"
        groupId="g"
        actorId="one"
        value={{ runtime: "codex", model: "test-model", reasoning_effort: "" }}
        onChange={vi.fn()}
      />,
    ),
  );
  const select = host.querySelector<HTMLSelectElement>("select")!;
  expect([...select.options].map((item) => item.value)).toEqual(["", "low", "high"]);
});

it("外部会话不请求模型目录且不显示可编辑字段", async () => {
  await act(async () =>
    root.render(
      <ActorModelConfigFields
        runtime="codex"
        groupId="g"
        actorId="one"
        value={null}
        onChange={vi.fn()}
        external
      />,
    ),
  );
  expect(api.fetchActorModels).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBeNull();
  expect(host.textContent).toContain("modelSettings.external");
});

it("使用统一下拉选择模型、清除不兼容强度，并保留自定义和默认入口", async () => {
  vi.mocked(api.fetchActorModels).mockResolvedValue({
    ok: true,
    result: {
      available: true,
      models: [{ id: "test-model", name: "测试模型", reasoning_efforts: ["low"] }],
    },
  });
  const changed = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<ActorModelConfig | null>({
      runtime: "codex",
      model: "",
      reasoning_effort: "high",
    });
    return (
      <ActorModelConfigFields
        runtime="codex"
        groupId="g"
        actorId="one"
        value={value}
        onChange={(next) => {
          changed(next);
          setValue(next);
        }}
      />
    );
  }
  await act(async () => root.render(<Fixture />));
  const trigger = host.querySelector<HTMLButtonElement>(
    'button[role="combobox"][aria-label="modelSettings.model"]',
  );
  expect(trigger).not.toBeNull();
  await act(async () => trigger!.click());
  const item = [...document.querySelectorAll<HTMLElement>("[cmdk-item]")].find((e) =>
    e.textContent?.includes("测试模型"),
  )!;
  expect(item.textContent).toContain("test-model");
  await act(async () => item.click());
  expect(changed).toHaveBeenLastCalledWith({
    runtime: "codex",
    model: "test-model",
    reasoning_effort: "",
  });
  expect(trigger!.textContent).toContain("测试模型");
  await act(async () => trigger!.click());
  const custom = [...document.querySelectorAll<HTMLElement>("[cmdk-item]")].find((e) =>
    e.textContent?.includes("modelSettings.customModel"),
  )!;
  await act(async () => custom.click());
  const input = host.querySelector<HTMLInputElement>(
    'input[aria-label="modelSettings.customModelId"]',
  )!;
  expect(input).not.toBeNull();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
      input,
      "custom-model",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(changed).toHaveBeenLastCalledWith({
    runtime: "codex",
    model: "custom-model",
    reasoning_effort: "",
  });
  await act(async () => trigger!.click());
  const inherit = [...document.querySelectorAll<HTMLElement>("[cmdk-item]")].find((e) =>
    e.textContent?.startsWith("modelSettings.inherit"),
  )!;
  await act(async () => inherit.click());
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(host.querySelector('input[aria-label="modelSettings.customModelId"]')).toBeNull();
});
