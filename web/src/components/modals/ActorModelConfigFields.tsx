import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ActorModelConfig, ActorModelOption } from "../../types";
import { fetchActorModels } from "../../services/api";
import { Input } from "../ui/input";
import { SelectCombobox } from "../SelectCombobox";
import { actorModelConfigsEqual } from "../../utils/actorModelConfig";

export function ActorModelConfigFields({
  runtime,
  value,
  onChange,
  groupId,
  actorId,
  running = false,
  effective,
  disabled = false,
  external = false,
  dirty = false,
}: {
  runtime: string;
  value: ActorModelConfig | null;
  onChange: (value: ActorModelConfig | null) => void;
  groupId?: string;
  actorId?: string;
  running?: boolean;
  effective?: ActorModelConfig | null;
  disabled?: boolean;
  external?: boolean;
  dirty?: boolean;
}) {
  const { t } = useTranslation("actors");
  const customInputId = useId();
  const [customRequested, setCustomRequested] = useState(false);
  const [models, setModels] = useState<ActorModelOption[]>([]);
  const [cached, setCached] = useState(false);
  const supported = runtime === "codex" || runtime === "claude";
  const config = value?.runtime === runtime ? value : null;
  const model = config?.model || "";
  const effort = config?.reasoning_effort || "";
  useEffect(() => {
    setCustomRequested(false);
  }, [groupId, actorId, runtime]);
  useEffect(() => {
    setModels([]);
    setCached(false);
    if (!supported || external || !groupId || !actorId) return;
    let current = true;
    void fetchActorModels(groupId, actorId)
      .then((result) => {
        if (current && result.ok) {
          setModels(result.result.models);
          setCached(result.result.source === "cache");
        }
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, [groupId, actorId, runtime, supported, external]);
  const options = models.length
    ? models
    : runtime === "claude"
      ? ["opus", "sonnet", "haiku"].map((id) => ({
          id,
          name: id,
          reasoning_efforts: ["low", "medium", "high", "xhigh", "max"],
        }))
      : [];
  const selected = options.find((item) => item.id === model);
  const custom = customRequested || Boolean(model && !selected);
  const efforts =
    selected?.reasoning_efforts ??
    (runtime === "claude"
      ? ["low", "medium", "high", "xhigh", "max"]
      : ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"]);
  const change = (nextModel: string, nextEffort: string) => {
    onChange(
      nextModel || nextEffort
        ? {
            runtime: runtime as ActorModelConfig["runtime"],
            model: nextModel,
            reasoning_effort: nextEffort,
          }
        : null,
    );
  };
  const pending = running && !actorModelConfigsEqual(config, effective);
  const describe = (item?: ActorModelConfig | null) =>
    `${item?.model || t("modelSettings.inherit")} · ${item?.reasoning_effort ? t(`modelSettings.levels.${item.reasoning_effort}`) : t("modelSettings.inherit")}`;
  return (
    <section className="mt-5 space-y-3 border-t border-[var(--glass-border-subtle)] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
          {t("modelSettings.title")}
        </h3>
        {(pending || dirty) && (
          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {t(dirty ? "modelSettings.unsaved" : "modelSettings.pending")}
          </span>
        )}
      </div>
      {!supported || external ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          {t(external ? "modelSettings.external" : "modelSettings.unsupported")}
        </p>
      ) : (
        <>
          {running && (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t("modelSettings.current", { value: describe(effective) })}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <span className="block">{t("modelSettings.model")}</span>
              <SelectCombobox
                ariaLabel={t("modelSettings.model")}
                value={custom ? "custom" : model ? `model:${model}` : ""}
                disabled={disabled}
                searchable
                searchPlaceholder={t("modelSettings.searchModels")}
                emptyText={t("modelSettings.noModels")}
                className="glass-input min-h-[40px] w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text-primary)]"
                contentClassName="min-w-[min(20rem,calc(100vw-2rem))] max-h-[calc(var(--radix-popover-content-available-height)-2px)] max-w-[calc(100vw-2rem)] [&_[role=option]_.truncate]:whitespace-normal [&_[role=option]_.truncate]:break-words"
                items={[
                  {
                    value: "",
                    label: t("modelSettings.inherit"),
                    description: t("modelSettings.inheritModelHint"),
                    persistent: true,
                  },
                  ...options.map((item) => ({
                    value: `model:${item.id}`,
                    label: item.name,
                    description: item.name !== item.id ? item.id : undefined,
                    group: t("modelSettings.availableModels"),
                  })),
                  {
                    value: "custom",
                    label: t("modelSettings.customModel"),
                    description: t("modelSettings.customModelHint"),
                    group: t("modelSettings.moreOptions"),
                    persistent: true,
                  },
                ]}
                onChange={(choice) => {
                  if (choice === "custom") {
                    setCustomRequested(true);
                    return;
                  }
                  setCustomRequested(false);
                  const next = choice.startsWith("model:") ? choice.slice(6) : "";
                  const allowed = options.find((item) => item.id === next)?.reasoning_efforts;
                  change(next, allowed && !allowed.includes(effort) ? "" : effort);
                }}
              />
              {custom && (
                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor={customInputId}
                    className="block text-[11px] text-[var(--color-text-muted)]"
                  >
                    {t("modelSettings.customModelId")}
                  </label>
                  <Input
                    id={customInputId}
                    aria-label={t("modelSettings.customModelId")}
                    value={model}
                    maxLength={256}
                    placeholder={t("modelSettings.modelPlaceholder")}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={disabled}
                    onChange={(event) => change(event.target.value, effort)}
                    onBlur={() => {
                      if (model !== model.trim()) change(model.trim(), effort);
                    }}
                  />
                </div>
              )}
            </div>
            <label className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <span>{t("modelSettings.effort")}</span>
              <select
                aria-label={t("modelSettings.effort")}
                value={effort}
                disabled={disabled || efforts.length === 0}
                className="glass-input min-h-[40px] w-full rounded-xl border px-3 py-2 text-sm text-[var(--color-text-primary)]"
                onChange={(event) => change(model, event.target.value)}
              >
                <option value="">{t("modelSettings.inherit")}</option>
                {efforts.map((level) => (
                  <option key={level} value={level}>
                    {t(`modelSettings.levels.${level}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
            {t("modelSettings.hint")}
          </p>
          {!selected && model && (
            <p className="text-xs text-[var(--color-text-muted)]">
              {t("modelSettings.customHint")}
            </p>
          )}
          {cached && (
            <p className="text-xs text-[var(--color-text-muted)]">{t("modelSettings.cacheHint")}</p>
          )}
        </>
      )}
    </section>
  );
}
