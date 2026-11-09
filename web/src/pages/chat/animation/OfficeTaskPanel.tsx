import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Actor, Task } from "../../../types";
import { useTaskBoardData } from "../../../features/contextModal/useTaskBoardData";
import { SelectCombobox } from "../../../components/SelectCombobox";
import { Button } from "../../../components/ui/button";
import { officeTaskMember, officeTaskStateKey } from "./officeTaskPresentation";
import { OfficeTaskActions } from "./OfficeTaskActions";
import { OfficeRequirementView } from "../requirements/OfficeRequirementView";

type Status = "active" | "planned" | "done";
type Props = {
  groupId: string;
  actors: Actor[];
  tasksVersion?: string;
  offDuty: boolean;
  onClose: () => void;
};

export function OfficeTaskPanel({ groupId, actors, tasksVersion, offDuty, onClose }: Props) {
  const { t } = useTranslation("chat");
  const heading = useRef<HTMLHeadingElement>(null);
  const panelId = useId();
  const listId = `office-task-list-${panelId}`;
  const [view, setView] = useState<"requirements" | "tasks">("tasks");
  const [status, setStatus] = useState<Status>("active");
  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState("__all__");
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [selected, setSelected] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [retryDetail, setRetryDetail] = useState(0);
  const data = useTaskBoardData({
    groupId,
    isOpen: view === "tasks",
    query,
    assignee,
    filter: blockedOnly ? "blocked" : "all",
    includeArchived: false,
    contextTasksVersion: tasksVersion,
    selectedTaskId: selected,
  });
  const { loadTaskDetail } = data;
  const column = data.columns[status];
  const countsKnown =
    data.matchingCount !== null || Object.keys(data.facets.statusCounts).length > 0;
  const detail = selected ? data.taskMap.get(selected) : undefined;
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (!selected || view !== "tasks") return;
    let current = true;
    setDetailLoading(true);
    setDetailError(false);
    void loadTaskDetail(selected)
      .then((task) => {
        if (current) {
          setDetailLoading(false);
          setDetailError(!task);
        }
      })
      .catch(() => {
        if (current) {
          setDetailLoading(false);
          setDetailError(true);
        }
      });
    return () => {
      current = false;
    };
  }, [selected, loadTaskDetail, retryDetail, view]);
  const member = (id?: string | null) =>
    officeTaskMember(actors, id) || t("officeTasks.unassigned");
  const priority = (value?: string | null) =>
    value && ["low", "normal", "high", "urgent"].includes(value)
      ? t(`officeTasks.priority.${value}`)
      : value || "";
  const selectTask = (task: Task) => setSelected(selected === task.id ? "" : task.id);
  const chooseStatus = (value: Status) => {
    setStatus(value);
    setSelected("");
    if (value === "done") setBlockedOnly(false);
  };
  const openLinkedTask = (task: Task) => {
    setView("tasks");
    setStatus(task.status === "planned" || task.status === "done" ? task.status : "active");
    setQuery("");
    setAssignee("__all__");
    setBlockedOnly(false);
    setSelected(task.id);
  };
  return (
    <section
      className="office-tasks"
      data-office-task-panel
      aria-label={t("officeTasks.title")}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          if (selected) setSelected("");
          else onClose();
        }
      }}
    >
      <header className="office-tasks__header">
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {t("officeTasks.title")}
          </h2>
          <p>
            {t("officeTasks.manager", {
              name: member(actors.find((actor) => actor.role === "foreman")?.id),
            })}
          </p>
        </div>
        <Button size="sm" variant="outline" data-office-tasks-close onClick={onClose}>
          {t("officeTasks.back")}
        </Button>
      </header>
      {offDuty && (
        <p className="office-tasks__notice" role="status">
          {t("officeTasks.offDuty")}
        </p>
      )}
      <div
        className="office-tasks__tabs office-requirements__views"
        role="group"
        aria-label={t("requirements.views")}
      >
        {(["requirements", "tasks"] as const).map((item) => (
          <button
            key={item}
            type="button"
            data-office-view={item}
            aria-pressed={view === item}
            onClick={() => {
              setView(item);
              setSelected("");
            }}
          >
            {t(item === "requirements" ? "requirements.view" : "requirements.taskView")}
          </button>
        ))}
      </div>
      {view === "requirements" ? (
        <OfficeRequirementView
          key={groupId}
          groupId={groupId}
          actors={actors}
          onOpenTask={openLinkedTask}
        />
      ) : (
        <>
          <div className="office-tasks__tabs" role="tablist" aria-label={t("officeTasks.views")}>
            {(["active", "planned", "done"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={`office-task-tab-${panelId}-${value}`}
                aria-selected={status === value}
                aria-controls={listId}
                tabIndex={status === value ? 0 : -1}
                onClick={() => chooseStatus(value)}
                onKeyDown={(event) => {
                  const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
                  if (!keys.includes(event.key)) return;
                  event.preventDefault();
                  const statuses: Status[] = ["active", "planned", "done"];
                  const index = statuses.indexOf(value);
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 2
                        : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                  chooseStatus(statuses[next]);
                  event.currentTarget.parentElement
                    ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                    [next]?.focus();
                }}
              >
                {t(`officeTasks.${value}`)}{" "}
                <span>{countsKnown ? data.facets.statusCounts[value] || 0 : "—"}</span>
              </button>
            ))}
          </div>
          <div className="office-tasks__filters">
            <input
              className="glass-input"
              type="search"
              value={query}
              onChange={(event) => {
                setSelected("");
                setQuery(event.target.value);
              }}
              placeholder={t("officeTasks.search")}
              aria-label={t("officeTasks.search")}
            />
            <SelectCombobox
              value={assignee}
              onChange={(value) => {
                setSelected("");
                setAssignee(value);
              }}
              ariaLabel={t("officeTasks.assignee")}
              searchable
              items={[
                { value: "__all__", label: t("officeTasks.allMembers") },
                ...data.facets.assignees.map((id) => ({ value: id, label: member(id) })),
              ]}
              className="glass-input office-tasks__assignee"
            />
            {status !== "done" && (
              <button
                type="button"
                className="office-tasks__filter-button"
                aria-pressed={blockedOnly}
                onClick={() => {
                  setSelected("");
                  setBlockedOnly(!blockedOnly);
                }}
              >
                {t("officeTasks.blocked")} {countsKnown ? data.facets.blocked : "—"}
              </button>
            )}
          </div>
          <div
            className="office-tasks__body"
            id={listId}
            role="tabpanel"
            aria-labelledby={`office-task-tab-${panelId}-${status}`}
            aria-busy={column.loading}
          >
            {data.error && (
              <div className="office-tasks__error" role="alert">
                <span>{t("officeTasks.loadError")}</span>
                <Button size="sm" variant="outline" onClick={() => void data.refresh()}>
                  {t("officeTasks.retry")}
                </Button>
              </div>
            )}
            {detailError && selected && !column.items.some((task) => task.id === selected) && (
              <p className="office-tasks__error" role="alert">
                {t("officeTasks.detailError")}
              </p>
            )}
            {column.loading && !column.items.length ? (
              <p className="office-tasks__empty" role="status">
                {t("officeTasks.loading")}
              </p>
            ) : !column.items.length && !data.error ? (
              <p className="office-tasks__empty">
                {query || assignee !== "__all__" || blockedOnly
                  ? t("officeTasks.noMatches")
                  : t(
                      status === "planned"
                        ? "officeTasks.noPlans"
                        : status === "active"
                          ? "officeTasks.noActive"
                          : "officeTasks.noDone",
                    )}
              </p>
            ) : null}
            <div className="office-tasks__list">
              {column.items.map((task) => (
                <article key={task.id} className="office-tasks__item">
                  <button
                    type="button"
                    className="office-tasks__task"
                    data-office-task-id={task.id}
                    aria-expanded={selected === task.id}
                    onClick={() => selectTask(task)}
                  >
                    <span className="office-tasks__task-heading">
                      <span className="office-tasks__id">{task.id}</span>
                      <strong>{task.title || task.id}</strong>
                      <span aria-hidden="true">{selected === task.id ? "−" : "+"}</span>
                    </span>
                    <span className="office-tasks__meta">
                      <span>{member(task.assignee)}</span>
                      <span className="office-tasks__state" data-state={officeTaskStateKey(task)}>
                        {t(`officeTasks.state.${officeTaskStateKey(task)}`)}
                      </span>
                      {task.priority && <span>{priority(task.priority)}</span>}
                      {task.requirement_id && (
                        <span>
                          {t("requirements.taskRequirement", { id: task.requirement_id })}
                        </span>
                      )}
                      {task.parent_id && (
                        <span>{t("officeTasks.parent", { id: task.parent_id })}</span>
                      )}
                    </span>
                  </button>
                  <OfficeTaskActions
                    groupId={groupId}
                    task={task}
                    onUpdated={data.refresh}
                    onDeleted={(ids) => {
                      ids.forEach(data.forgetTask);
                      if (ids.includes(selected)) setSelected("");
                    }}
                  />
                  {selected === task.id && (
                    <div className="office-tasks__detail">
                      {detailLoading ? (
                        <p role="status">{t("officeTasks.loading")}</p>
                      ) : detailError ? (
                        <div role="alert">
                          <span>{t("officeTasks.detailError")}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRetryDetail((value) => value + 1)}
                          >
                            {t("officeTasks.retry")}
                          </Button>
                        </div>
                      ) : detail ? (
                        <>
                          {detail.outcome && (
                            <div>
                              <h3>{t("officeTasks.outcome")}</h3>
                              <p>{detail.outcome}</p>
                            </div>
                          )}
                          {detail.notes && (
                            <div>
                              <h3>{t("officeTasks.notes")}</h3>
                              <p>{detail.notes}</p>
                            </div>
                          )}
                          {!!detail.blocked_by?.length && (
                            <div>
                              <h3>{t("officeTasks.dependencies")}</h3>
                              <p>
                                {detail.blocked_by
                                  .map((id) =>
                                    data.taskMap.get(id)?.title
                                      ? `${id} · ${data.taskMap.get(id)!.title}`
                                      : id,
                                  )
                                  .join("\n")}
                              </p>
                            </div>
                          )}
                          {detail.handoff_to && (
                            <p>{t("officeTasks.handoffTo", { name: member(detail.handoff_to) })}</p>
                          )}
                          {!!detail.checklist?.length && (
                            <div>
                              <h3>{t("officeTasks.checklist")}</h3>
                              <ul>
                                {detail.checklist.map((item, index) => (
                                  <li key={item.id || index}>
                                    <span aria-hidden="true">
                                      {item.status === "done" ? "☑" : "☐"}
                                    </span>{" "}
                                    {item.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {!!detail.children?.length && (
                            <div>
                              <h3>{t("officeTasks.subtasks")}</h3>
                              <ul>
                                {detail.children.map((child) => (
                                  <li key={child.id}>
                                    {child.id} · {child.title} · {member(child.assignee)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {!detail.outcome &&
                            !detail.notes &&
                            !detail.blocked_by?.length &&
                            !detail.checklist?.length &&
                            !detail.children?.length &&
                            !detail.handoff_to && <p>{t("officeTasks.noDetails")}</p>}
                        </>
                      ) : null}
                    </div>
                  )}
                </article>
              ))}
            </div>
            {column.hasMore && (
              <Button
                variant="outline"
                className="office-tasks__more"
                disabled={column.loading}
                onClick={() => void data.loadMore(status)}
              >
                {t(column.loading ? "officeTasks.loading" : "officeTasks.loadMore")}
              </Button>
            )}
            {!!column.items.length && (
              <p className="office-tasks__count">
                {t("officeTasks.showing", { count: column.items.length, total: column.totalCount })}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
