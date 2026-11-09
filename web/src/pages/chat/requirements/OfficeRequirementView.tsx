import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/button";
import {
  fetchRequirement,
  fetchRequirements,
  type RequirementDetail,
  type RequirementSummary,
} from "../../../services/api";
import { useGroupStore } from "../../../stores/useGroupStore";
import { useUIStore } from "../../../stores/useUIStore";
import type { Actor, Task } from "../../../types";
import { RequirementIssueButton } from "./RequirementIssueButton";
import { ObsidianImportButton } from "./ObsidianImportButton";
import { OfficeRequirementDetail } from "./OfficeRequirementDetail";

const PAGE_SIZE = 30;

type Props = { groupId: string; actors: Actor[]; onOpenTask: (task: Task) => void };

export function OfficeRequirementView({ groupId, actors, onOpenTask }: Props) {
  const { t } = useTranslation("chat");
  const version = useGroupStore((state) =>
    state.selectedGroupId === groupId ? state.groupContext?.version : undefined,
  );
  const readOnly = useUIStore((state) => state.webReadOnly);
  const [offset, setOffset] = useState(0);
  const [list, setList] = useState<{
    requirements: RequirementSummary[];
    total: number;
    has_more: boolean;
  }>();
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<RequirementDetail>();
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const refresh = () => setAttempt((value) => value + 1);
  const canImport =
    !readOnly && ["127.0.0.1", "localhost", "[::1]"].includes(window.location.hostname);

  useEffect(() => {
    // 看板打开且可见时定期对账，覆盖会话事件连接的短暂空档。
    const timer = window.setInterval(() => {
      if (!document.hidden) setAttempt((value) => value + 1);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [groupId, version]);

  useEffect(() => {
    const request = new AbortController();
    setLoading(true);
    setListError("");
    void fetchRequirements(groupId, offset, request.signal)
      .then((response) => {
        if (request.signal.aborted) return;
        if (response.ok) setList(response.result);
        else setListError(response.error.message);
        setLoading(false);
      })
      .catch(() => {
        if (request.signal.aborted) return;
        setListError("requirements.loadError");
        setLoading(false);
      });
    return () => request.abort();
  }, [groupId, offset, version, attempt]);

  useEffect(() => {
    if (!selected) return;
    const request = new AbortController();
    setDetailError("");
    void fetchRequirement(groupId, selected, request.signal)
      .then((response) => {
        if (request.signal.aborted) return;
        if (response.ok) setDetail(response.result);
        else setDetailError(response.error.message);
      })
      .catch(() => {
        if (!request.signal.aborted) setDetailError("requirements.loadError");
      });
    return () => request.abort();
  }, [groupId, selected, version, attempt]);

  function show(result: RequirementDetail) {
    setDetail(result);
    setSelected(result.requirement.id);
    refresh();
  }
  function changePage(next: number) {
    setSelected("");
    setDetail(undefined);
    setList(undefined);
    setOffset(next);
  }

  const rows = list?.requirements || [];
  const selectedOutsidePage =
    detail?.requirement.id === selected && !rows.some((item) => item.id === selected);
  const visibleRows = selectedOutsidePage ? [detail.requirement, ...rows] : rows;
  return (
    <div
      className="office-tasks__body office-requirements"
      aria-label={t("requirements.view")}
      aria-busy={loading}
      onKeyDown={(event) => {
        if (selected && event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          setSelected("");
        }
      }}
    >
      {!readOnly && (
        <div className="office-requirements__toolbar">
          <RequirementIssueButton
            groupId={groupId}
            onCreated={(result) => {
              setOffset(0);
              show(result);
            }}
          />
          {canImport && (
            <ObsidianImportButton
              groupId={groupId}
              onImported={(result) => {
                setOffset(0);
                show(result);
              }}
            />
          )}
        </div>
      )}
      {listError && (
        <div className="office-tasks__error" role="alert">
          <span>{t(listError)}</span>
          <Button size="sm" variant="outline" onClick={refresh}>
            {t("officeTasks.retry")}
          </Button>
        </div>
      )}
      {loading && !list && (
        <p className="office-tasks__empty" role="status">
          {t("officeTasks.loading")}
        </p>
      )}
      {!loading && !listError && !visibleRows.length && (
        <p className="office-tasks__empty">{t("requirements.empty")}</p>
      )}
      {visibleRows.map((record) => (
        <article key={record.id} className="office-tasks__item">
          <button
            type="button"
            className="office-tasks__task"
            data-requirement-id={record.id}
            aria-expanded={selected === record.id}
            onClick={() => {
              setSelected(selected === record.id ? "" : record.id);
              setDetail(undefined);
            }}
          >
            <span className="office-tasks__task-heading">
              <span className="office-tasks__id">{record.id}</span>
              <strong>{record.title}</strong>
              <span aria-hidden="true">{selected === record.id ? "−" : "+"}</span>
            </span>
            <span className="office-tasks__meta">
              <span className="office-tasks__state" data-requirement-status={record.status}>
                {t("requirements.status." + record.status)}
              </span>
              <span>
                {t("requirements.taskCount", {
                  done: record.task_counts.done,
                  total: record.task_counts.total,
                })}
              </span>
              {record.task_counts.blocked > 0 && (
                <span>
                  {t("officeTasks.blocked")} {record.task_counts.blocked}
                </span>
              )}
            </span>
          </button>
          {selected === record.id &&
            (detailError ? (
              <div className="office-tasks__error" role="alert">
                <span>{t(detailError)}</span>
                <Button size="sm" variant="outline" onClick={refresh}>
                  {t("officeTasks.retry")}
                </Button>
              </div>
            ) : detail?.requirement.id === record.id ? (
              <OfficeRequirementDetail
                key={record.id}
                groupId={groupId}
                detail={detail}
                actors={actors}
                readOnly={readOnly}
                canImport={canImport}
                onChanged={show}
                onRefresh={refresh}
                onOpenTask={onOpenTask}
              />
            ) : (
              <p className="office-tasks__empty" role="status">
                {t("officeTasks.loading")}
              </p>
            ))}
        </article>
      ))}
      {(offset > 0 || list?.has_more) && (
        <div className="office-requirements__toolbar">
          <Button
            size="sm"
            variant="outline"
            disabled={offset === 0 || loading}
            onClick={() => changePage(offset - PAGE_SIZE)}
          >
            {t("requirements.previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!list?.has_more || loading}
            onClick={() => changePage(offset + PAGE_SIZE)}
          >
            {t("requirements.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
