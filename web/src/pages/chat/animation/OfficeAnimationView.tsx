import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "zustand";
import { pendingReplyView } from "../../../features/pendingReplies/model";
import { usePendingPages } from "../../../features/pendingReplies/usePendingPages";
import {
  createPendingReplyStore,
  PendingReplyStoreContext,
  replyKey,
} from "../../../features/pendingReplies/store";
import { useGroupStore } from "../../../stores/useGroupStore";
import { useUIStore } from "../../../stores/useUIStore";
import type { Actor, ChatMessageData } from "../../../types";
import { OfficeCanvas, type OfficeActorView } from "./OfficeCanvas";
import { currentOfficeActivity, latestOfficeUtterance } from "./officeEvents";
import { officePage, officeState } from "./officeProjection";
import "./officeAnimation.css";
import "./officeTasks.css";
import { useOfficeTasks } from "./useOfficeTasks";
import { OfficeTaskPanel } from "./OfficeTaskPanel";

type Props = {
  groupId: string;
  actors: Actor[];
  onInspectActor: (actorId: string) => void;
  onOpenPending: (eventId: string) => void;
};
type PendingItem = { id: string; actorId: string; text: string };
const emptyReplyStore = createPendingReplyStore();

const ACTIVITY_KINDS = new Set([
  "command",
  "file_change",
  "search",
  "tool",
  "thinking",
  "planning",
  "reply",
  "review",
]);

export function OfficeAnimationView({ groupId, actors, onInspectActor, onOpenPending }: Props) {
  const { t } = useTranslation("chat");
  const bucket = useGroupStore((state) => state.chatByGroup[groupId]);
  const leaves = useGroupStore((state) =>
    state.groupDoc?.group_id === groupId ? state.groupDoc.actor_leaves : undefined,
  );
  const waitingForGroup = useGroupStore((state) =>
    state.groupDoc?.group_id === groupId
      ? !state.groupDoc.running || state.groupDoc.state !== "active"
      : false,
  );
  const tasksVersion = useGroupStore((state) => state.groupContext?.tasks_version);
  const showPendingPrompts = useUIStore((state) => state.showPendingPrompts);
  const pending = usePendingPages(groupId, showPendingPrompts);
  const {
    active: pendingActive,
    loaded: pendingLoaded,
    hasMore: pendingHasMore,
    loading: pendingLoading,
    error: pendingError,
    loadMore: loadMorePending,
  } = pending;
  const replyStore = useContext(PendingReplyStoreContext);
  const replyEntries = useStore(replyStore ?? emptyReplyStore, (state) => state.entries);
  const taskBoard = useOfficeTasks(groupId, tasksVersion);
  const tasks = taskBoard.data?.pages.active?.tasks;
  const [taskPanelGroup, setTaskPanelGroup] = useState("");
  const taskPanelOpen = taskPanelGroup === groupId;
  const taskButtonRef = useRef<HTMLButtonElement>(null);
  const openTasks = () => {
    setPendingMenu(null);
    setTaskPanelGroup(groupId);
  };
  const closeTasks = () => {
    setTaskPanelGroup("");
    window.requestAnimationFrame(() => taskButtonRef.current?.focus());
  };
  const [requestedPage, setRequestedPage] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [pendingMenu, setPendingMenu] = useState<{ actorId?: string } | null>(null);
  const page = officePage(actors, requestedPage);

  useEffect(() => {
    if (pendingActive && pendingLoaded && pendingHasMore && !pendingLoading && !pendingError)
      void loadMorePending();
  }, [pendingActive, pendingLoaded, pendingHasMore, pendingLoading, pendingError, loadMorePending]);

  const pendingItems = useMemo(() => {
    const actorIds = new Set(actors.map((actor) => actor.id));
    return pending.events.flatMap((event): PendingItem[] => {
      const actorId = String(event.by || "");
      const id = String(event.id || "");
      const view = pendingReplyView(event);
      if (
        !id ||
        !actorIds.has(actorId) ||
        view?.state !== "pending" ||
        replyEntries[replyKey(groupId, id)]?.closed
      )
        return [];
      const data = event.data as ChatMessageData | undefined;
      const text = (view.question?.prompt || String(data?.text || ""))
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
      return [{ id, actorId, text }];
    });
  }, [actors, groupId, pending.events, replyEntries]);
  const pendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of pendingItems) counts[item.actorId] = (counts[item.actorId] || 0) + 1;
    return counts;
  }, [pendingItems]);
  const menuItems = pendingMenu?.actorId
    ? pendingItems.filter((item) => item.actorId === pendingMenu.actorId)
    : pendingItems;
  useEffect(() => {
    setPendingMenu(null);
    setSelectedId("");
    setRequestedPage(0);
  }, [groupId]);
  useEffect(() => {
    if (pendingMenu && menuItems.length === 0) setPendingMenu(null);
  }, [pendingMenu, menuItems.length]);
  useEffect(() => {
    if (!pendingMenu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingMenu(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [pendingMenu]);
  const openPending = (items: PendingItem[], actorId?: string) => {
    if (items.length === 1) {
      setPendingMenu(null);
      onOpenPending(items[0].id);
    } else if (items.length > 1) {
      setPendingMenu({ actorId });
    }
  };

  const views = useMemo(() => {
    const result: Record<string, OfficeActorView> = {};
    for (const actor of actors) {
      const state = officeState(actor);
      const activity = currentOfficeActivity(
        actor,
        bucket?.rawHeadlessEventsByActorId[actor.id] || [],
      );
      const task = tasks?.find((item) => item.assignee === actor.id && item.status === "active");
      const activityKind = activity && ACTIVITY_KINDS.has(activity.kind) ? activity.kind : "tool";
      const activityLabel = activity ? t(`animationOffice.activities.${activityKind}`) : "";
      const coordinating = actor.availability === "handoff" || actor.availability === "returning";
      const controlLabel = coordinating
        ? waitingForGroup
          ? t("actors:leave.waitingForGroupShort")
          : t(
              `actors:leave.status.${actor.availability === "returning" ? "returning" : leaves?.[actor.leave_id || ""]?.status || "preparing"}`,
            )
        : "";
      result[actor.id] = {
        state,
        stateLabel: coordinating ? controlLabel : t(`animationOffice.states.${state}`),
        actionLabel: coordinating
          ? controlLabel
          : activity
            ? [activityLabel, activity.label].filter(Boolean).join(" · ")
            : "",
        taskTitle: coordinating ? "" : task?.title?.trim() || "",
        utterance: latestOfficeUtterance(
          actor,
          bucket?.rawHeadlessEventsByActorId[actor.id] || [],
          Date.now(),
        ),
      };
    }
    return result;
  }, [actors, bucket?.rawHeadlessEventsByActorId, tasks, t, leaves, waitingForGroup]);

  const chooseActor = (id: string) => {
    const index = actors.findIndex((actor) => actor.id === id);
    if (index < 0) return;
    setRequestedPage(Math.floor(index / 6));
    setSelectedId(id);
    onInspectActor(id);
  };

  return (
    <div className="office-animation" data-office-animation>
      <section className="office-animation__stage" aria-label={t("animationOffice.sceneLabel")}>
        <div className="office-animation__stage-top" inert={taskPanelOpen || undefined}>
          <span>
            <i className="office-dot office-dot--working" />
            {t("animationOffice.live")}
          </span>
          <div className="office-animation__stage-actions">
            <button
              ref={taskButtonRef}
              type="button"
              className="office-animation__task-summary"
              data-office-tasks-open
              aria-label={t("officeTasks.open")}
              aria-expanded={taskPanelOpen}
              onClick={openTasks}
            >
              {taskBoard.data
                ? t("officeTasks.summaryEntry", {
                    active: taskBoard.data.facets.statusCounts.active || 0,
                    planned: taskBoard.data.facets.statusCounts.planned || 0,
                  })
                : `${t("officeTasks.title")} …`}
            </button>
            {pendingItems.length ? (
              <button
                type="button"
                className="office-animation__pending-summary"
                data-office-pending-summary
                aria-haspopup="dialog"
                aria-expanded={!!pendingMenu}
                onClick={() => openPending(pendingItems)}
              >
                {t("animationOffice.pendingCount", { count: pendingItems.length })}
              </button>
            ) : null}
            {page.pageCount > 1 ? (
              <div className="office-animation__pager">
                <button
                  type="button"
                  disabled={page.page === 0}
                  onClick={() => setRequestedPage(page.page - 1)}
                  aria-label={t("animationOffice.previous")}
                >
                  ‹
                </button>
                <span>
                  {page.page + 1} / {page.pageCount}
                </span>
                <button
                  type="button"
                  disabled={page.page + 1 === page.pageCount}
                  onClick={() => setRequestedPage(page.page + 1)}
                  aria-label={t("animationOffice.next")}
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="office-animation__scene" inert={taskPanelOpen || undefined}>
          <OfficeCanvas
            groupId={groupId}
            members={page.members}
            actors={actors}
            views={views}
            events={bucket?.events || []}
            selectedId={selectedId}
            onSelect={chooseActor}
            taskBoard={taskBoard}
            offDuty={waitingForGroup}
            onOpenTasks={openTasks}
            pendingCounts={pendingCounts}
            onPendingActor={(id) =>
              openPending(
                pendingItems.filter((item) => item.actorId === id),
                id,
              )
            }
          />
        </div>
        {taskPanelOpen && (
          <OfficeTaskPanel
            key={groupId}
            groupId={groupId}
            actors={actors}
            tasksVersion={tasksVersion}
            offDuty={waitingForGroup}
            onClose={closeTasks}
          />
        )}
        {pendingMenu && menuItems.length ? (
          <div
            className="office-animation__pending-menu"
            role="dialog"
            aria-label={t("animationOffice.pendingList")}
          >
            <div className="office-animation__pending-menu-header">
              <strong>{t("animationOffice.pendingList")}</strong>
              <button
                type="button"
                onClick={() => setPendingMenu(null)}
                aria-label={t("animationOffice.closePending")}
              >
                ×
              </button>
            </div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="office-animation__pending-item"
                onClick={() => {
                  setPendingMenu(null);
                  onOpenPending(item.id);
                }}
              >
                <strong>
                  {actors.find((actor) => actor.id === item.actorId)?.title || item.actorId}
                </strong>
                <span>{item.text || t("animationOffice.pendingQuestion")}</span>
              </button>
            ))}
          </div>
        ) : null}
        {actors.length === 0 ? (
          <div className="office-animation__empty">{t("animationOffice.empty")}</div>
        ) : null}
      </section>
    </div>
  );
}
