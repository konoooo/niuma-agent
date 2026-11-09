// @vitest-environment happy-dom
import { expect, it } from "vite-plus/test";
import { migrateBrandStorage } from "./brandStorageMigration";

it("迁移旧草稿及设置，并优先保留新版已经保存的值", () => {
  const storage = window.sessionStorage;
  storage.setItem("cccc_draft_g1", "继续完成原来的任务");
  storage.setItem("cccc-office", "old");
  storage.setItem("niuma-office", "current");
  storage.setItem("unrelated", "keep");
  migrateBrandStorage(storage);
  expect(storage.getItem("niuma_draft_g1")).toBe("继续完成原来的任务");
  expect(storage.getItem("cccc_draft_g1")).toBeNull();
  expect(storage.getItem("niuma-office")).toBe("current");
  expect(storage.getItem("unrelated")).toBe("keep");
});
