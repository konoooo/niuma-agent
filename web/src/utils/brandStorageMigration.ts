function newStorageKey(key: string): string | undefined {
  if (key.startsWith("cccc_") || key.startsWith("cccc-")) return `niuma${key.slice(4)}`;
  if (key === "cccc" || key.startsWith("cccc:") || key.startsWith("cccc.")) {
    return `niuma-agent${key.slice(4)}`;
  }
  return undefined;
}

export function migrateBrandStorage(storage: Storage): void {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  for (const key of keys) {
    if (!key) continue;
    const target = newStorageKey(key);
    const value = storage.getItem(key);
    if (!target || value === null || storage.getItem(target) !== null) continue;
    storage.setItem(target, value);
    storage.removeItem(key);
  }
}

if (typeof window !== "undefined") {
  for (const kind of ["localStorage", "sessionStorage"] as const) {
    try {
      migrateBrandStorage(window[kind]);
    } catch {
      // 浏览器限制访问或容量不足时，保留尚未迁移的原设置。
    }
  }
}
