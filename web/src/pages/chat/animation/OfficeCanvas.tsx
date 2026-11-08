import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimationRegistry, createAppearanceResolver, mountScene } from "@pixoffice/renderer-pixi";
import { FrameAdapter } from "@pixoffice/animation-frame";
import {
  characterAssets,
  configureCharacterResources,
} from "@pixoffice/assets-office/frame/resources";
import {
  configureOfficeAssets,
  createReferenceOfficePresentation,
} from "@pixoffice/scene-office/pixi";
import { seatStepDurationMs } from "@pixoffice/scene-office/pixi/projection";
import { supportsOfficePose } from "@pixoffice/scene-office/core/poseSupport";
import type { ActorTaskPresentation } from "@pixoffice/contracts/presentation";
import type { Container } from "pixi.js";
import type { Actor, LedgerEvent } from "../../../types";
import { officeMessage, shouldAnimateOfficeMessage, type OfficeUtterance } from "./officeEvents";
import { officeScene } from "./officeScene";
import { planOfficeSpeech, type OfficeSpeechClock } from "./officeSpeech";
import type { OfficeState } from "./officeProjection";
import type { OfficeTasksState } from "./useOfficeTasks";
import { renderOfficeTaskSummary } from "./officeTaskPresentation";
import { officeTaskWhiteboard } from "./officeTaskWhiteboard";

export type OfficeActorView = {
  state: OfficeState;
  stateLabel: string;
  actionLabel: string;
  taskTitle: string;
  progress?: number;
  utterance?: OfficeUtterance | null;
};

type OfficeMember = { actor: Actor; sceneId: string };
type Props = {
  groupId: string;
  members: OfficeMember[];
  actors: Actor[];
  views: Record<string, OfficeActorView>;
  events: LedgerEvent[];
  selectedId: string;
  onSelect: (id: string) => void;
  pendingCounts?: Record<string, number>;
  onPendingActor?: (id: string) => void;
  taskBoard?: OfficeTasksState;
  offDuty?: boolean;
  onOpenTasks?: () => void;
};

type MountedScene = Awaited<ReturnType<typeof mountScene>>;

export function OfficeCanvas({
  groupId,
  members,
  actors,
  views,
  events,
  selectedId,
  onSelect,
  pendingCounts = {},
  onPendingActor,
  taskBoard,
  offDuty = false,
  onOpenTasks,
}: Props) {
  const { t } = useTranslation("chat");
  const hostRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef<MountedScene | null>(null);
  const membersRef = useRef(members);
  const viewsRef = useRef(views);
  const selectRef = useRef(onSelect);
  const boardRef = useRef(taskBoard);
  const boardActorsRef = useRef(actors);
  const offDutyRef = useRef(offDuty);
  const openTasksRef = useRef(onOpenTasks);
  const translateRef = useRef(t);
  const tasksRef = useRef(new Map<string, ActorTaskPresentation>());
  const signaturesRef = useRef(new Map<string, string>());
  const seenRef = useRef<{ key: string; ids: Set<string> } | null>(null);
  const sequenceRef = useRef(0);
  const speechTickRef = useRef<() => void>(() => {});
  const attentionRefs = useRef(new Map<string, HTMLDivElement>());
  const [ready, setReady] = useState(0);
  const [error, setError] = useState(false);
  membersRef.current = members;
  viewsRef.current = views;
  selectRef.current = onSelect;
  boardRef.current = taskBoard;
  boardActorsRef.current = actors;
  offDutyRef.current = offDuty;
  openTasksRef.current = onOpenTasks;
  translateRef.current = t;
  const sceneKey = JSON.stringify([
    groupId,
    ...members.map(({ actor, sceneId }) => [sceneId, actor.id, actor.title || ""]),
  ]);
  const attentionKey = JSON.stringify(
    members.map(({ actor, sceneId }) => [
      actor.id,
      sceneId,
      pendingCounts[actor.id] || 0,
      !!actor.runtime_confirmation_required,
    ]),
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const controller = new AbortController();
    let mounted: MountedScene | undefined;
    signaturesRef.current.clear();
    setError(false);
    const base = `${import.meta.env.BASE_URL}pixoffice`;
    configureOfficeAssets({ baseUrl: `${base}/assets/office` });
    configureCharacterResources(`${base}/characters`);
    void mountScene(
      host,
      async (signal) => {
        const pack = createReferenceOfficePresentation({
          taskForActor: (id) => tasksRef.current.get(id),
        });
        const createViews = pack.createPropViews;
        if (createViews)
          pack.createPropViews = () => {
            const registry = createViews();
            const original = registry.create.bind(registry);
            registry.create = (prop, template) =>
              template.view === "wall-whiteboard"
                ? officeTaskWhiteboard(() =>
                    renderOfficeTaskSummary(
                      boardRef.current || { data: null, loading: true, error: false },
                      boardActorsRef.current,
                      offDutyRef.current,
                      (key) => translateRef.current(key),
                    ),
                  )
                : original(prop, template);
            return registry;
          };
        return {
          product: {
            id: "pixoffice.classic",
            storageNamespace: "classic",
            presentationProfileId: "office-character-v1",
          },
          scene: officeScene(membersRef.current),
          pack,
          animations: new AnimationRegistry<Container>().register(
            new FrameAdapter((manifest) =>
              characterAssets.acquire(manifest.asset.id, manifest.source.uri),
            ),
          ),
          resolveAppearance: createAppearanceResolver(
            (id) =>
              new URL(`${base}/characters/visuals/${encodeURIComponent(id)}.json`, document.baseURI)
                .href,
            signal,
          ),
          runtimeOptions: {
            seatStepDuration: seatStepDurationMs,
            supportsPose: supportsOfficePose,
          },
        };
      },
      {
        signal: controller.signal,
        view: {
          onActorClick: ({ actorId }) => {
            const member = membersRef.current.find((item) => item.sceneId === actorId);
            if (member) selectRef.current(member.actor.id);
          },
          onPropClick: ({ propId }) => {
            const prop = mountedRef.current?.runtime
              .readWorld()
              .props.find((item) => item.id === propId);
            if (prop?.templateId === "office.wall-whiteboard") openTasksRef.current?.();
          },
        },
      },
    )
      .then((scene) => {
        if (controller.signal.aborted) {
          scene.dispose();
          return;
        }
        mounted = scene;
        mountedRef.current = scene;
        setReady((value) => value + 1);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => {
      controller.abort();
      if (mountedRef.current === mounted) mountedRef.current = null;
      mounted?.dispose();
    };
  }, [sceneKey]);

  useEffect(() => {
    const scene = mountedRef.current;
    if (!scene) return;
    for (const member of members) {
      const view = views[member.actor.id];
      const actor = scene.runtime.readActors().find((item) => item.id === member.sceneId);
      if (!view || !actor) continue;
      const title = view.actionLabel || view.taskTitle || view.stateLabel;
      const presentation: ActorTaskPresentation = {
        title,
        detail: view.stateLabel,
        status:
          view.state === "working"
            ? "running"
            : view.state === "idle"
              ? "idle"
              : view.state === "error"
                ? "failed"
                : "blocked",
        progressMode: "reported",
        progress: !view.actionLabel && view.taskTitle ? view.progress : undefined,
      };
      tasksRef.current.set(member.sceneId, presentation);
      const signature = JSON.stringify(presentation);
      if (signaturesRef.current.get(member.sceneId) === signature) continue;
      signaturesRef.current.set(member.sceneId, signature);
      scene.runtime.submit({
        protocolVersion: "2.0",
        sceneId: scene.runtime.sceneId,
        commandId: `state-${++sequenceRef.current}`,
        type: "actor.presentation.set",
        actorId: member.sceneId,
        sourceRevision: actor.presentation.sourceRevision + 1,
        status: view.state === "working" ? "working" : "idle",
        title: view.state === "working" ? title.slice(0, 200) : "",
      });
    }
  }, [members, views, ready]);

  useEffect(() => {
    const sceneId = members.find((member) => member.actor.id === selectedId)?.sceneId;
    mountedRef.current?.view.selectActor(sceneId);
  }, [members, ready, selectedId]);

  useEffect(() => {
    const scene = mountedRef.current;
    const host = hostRef.current;
    if (!scene || !host || !attentionRefs.current.size) return;
    let frame = 0;
    const update = () => {
      const box = host.getBoundingClientRect();
      for (const member of membersRef.current) {
        const element = attentionRefs.current.get(member.actor.id);
        if (!element) continue;
        const anchor = scene.view.actorLabelClientAnchor?.(member.sceneId);
        if (!anchor || box.width <= 0 || box.height <= 0) {
          element.style.visibility = "hidden";
          continue;
        }
        const x = Math.max(
          0,
          Math.min(box.width - element.offsetWidth, anchor.clientX - box.left + 4),
        );
        const y = Math.max(
          element.offsetHeight / 2,
          Math.min(box.height - element.offsetHeight / 2, anchor.clientY - box.top),
        );
        element.style.left = `${Math.round(x)}px`;
        element.style.top = `${Math.round(y)}px`;
        element.style.visibility = "visible";
      }
      frame = window.requestAnimationFrame(update);
    };
    update();
    return () => window.cancelAnimationFrame(frame);
  }, [attentionKey, ready, sceneKey]);

  useEffect(() => {
    const scene = mountedRef.current;
    if (!scene) return;
    const clocks = new Map<string, OfficeSpeechClock>();
    const active = new Map<string, { activityId: string; until: number }>();
    let lastSpeechAt = 0;
    const tick = () => {
      const now = Date.now();
      const currentMembers = membersRef.current;
      for (const [index, member] of currentMembers.entries()) {
        const view = viewsRef.current[member.actor.id];
        const ongoing = active.get(member.actor.id);
        if (ongoing && (view?.state !== "working" || now >= ongoing.until)) {
          scene.runtime.submit({
            protocolVersion: "2.0",
            sceneId: scene.runtime.sceneId,
            commandId: `speech-stop-${++sequenceRef.current}`,
            type: "activity.stop",
            activityId: ongoing.activityId,
          });
          active.delete(member.actor.id);
        }
        const detail = view?.actionLabel || view?.taskTitle || view?.stateLabel || "";
        const hint = translateRef.current("animationOffice.statusHint", { activity: detail });
        const previous = clocks.get(member.actor.id) || null;
        const plan = planOfficeSpeech(
          { working: view?.state === "working", hint, utterance: view?.utterance || null },
          previous,
          now,
          index,
        );
        if (!plan.clock) {
          clocks.delete(member.actor.id);
          continue;
        }
        if (!plan.speech) {
          clocks.set(member.actor.id, plan.clock);
          continue;
        }
        if (now - lastSpeechAt < 5_000) continue;
        const text = Array.from(plan.speech.text).slice(0, 120).join("");
        const result = scene.runtime.submit({
          protocolVersion: "2.0",
          sceneId: scene.runtime.sceneId,
          commandId: `speech-${++sequenceRef.current}`,
          type: "activity.start",
          capability: "scene.say",
          busyPolicy: "reject",
          participants: [{ entityId: member.sceneId, role: "actor" }],
          params: { text, durationMs: 5_000 },
        });
        if (["rejected", "failed", "cancelled", "expired"].includes(result.status)) continue;
        clocks.set(member.actor.id, plan.clock);
        if (result.activityId)
          active.set(member.actor.id, { activityId: result.activityId, until: now + 5_000 });
        lastSpeechAt = now;
        break;
      }
    };
    speechTickRef.current = tick;
    tick();
    const timer = window.setInterval(tick, 2_500);
    return () => {
      window.clearInterval(timer);
      speechTickRef.current = () => {};
    };
  }, [sceneKey, ready]);

  useEffect(() => {
    speechTickRef.current();
  }, [views]);

  useEffect(() => {
    const prior = seenRef.current;
    if (!prior || prior.key !== sceneKey) {
      seenRef.current = {
        key: sceneKey,
        ids: new Set(events.map((event) => event.id).filter((id): id is string => !!id)),
      };
      return;
    }
    const fresh = events.filter((event) => event.id && !prior.ids.has(event.id));
    for (const event of fresh) if (event.id) prior.ids.add(event.id);
    if (prior.ids.size > 2000)
      prior.ids = new Set(events.map((event) => event.id).filter((id): id is string => !!id));
    const scene = mountedRef.current;
    if (!scene) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    for (const event of fresh.slice(-3)) {
      if (!shouldAnimateOfficeMessage(event, Date.now())) continue;
      const message = officeMessage(event, actors);
      if (!message) continue;
      const sender = members.find((member) => member.actor.id === message.from);
      if (!sender) continue;
      const recipient =
        message.to.length === 1
          ? members.find((member) => member.actor.id === message.to[0])
          : undefined;
      const commandId = `message-${++sequenceRef.current}`;
      const text = message.text || t("animationOffice.message");
      const recipientState = recipient ? views[recipient.actor.id]?.state : undefined;
      if (
        recipient &&
        recipient.sceneId !== sender.sceneId &&
        (recipientState === "idle" || recipientState === "working")
      ) {
        scene.runtime.submit({
          protocolVersion: "2.0",
          sceneId: scene.runtime.sceneId,
          commandId,
          type: "activity.start",
          capability: "office.visit",
          busyPolicy: "reject",
          expiresAt: new Date(Date.now() + 8_000).toISOString(),
          participants: [
            { entityId: sender.sceneId, role: "visitor" },
            { entityId: recipient.sceneId, role: "host" },
          ],
          params: { stops: [{ hostId: recipient.sceneId, message: text }], durationMs: 1800 },
        });
      } else {
        scene.runtime.submit({
          protocolVersion: "2.0",
          sceneId: scene.runtime.sceneId,
          commandId,
          type: "activity.start",
          capability: "scene.say",
          busyPolicy: "reject",
          expiresAt: new Date(Date.now() + 8_000).toISOString(),
          participants: [{ entityId: sender.sceneId, role: "actor" }],
          params: { text, durationMs: 1800 },
        });
      }
    }
  }, [actors, events, members, ready, sceneKey, t, views]);

  return (
    <div className="office-canvas" ref={hostRef}>
      {members.map(({ actor }) => {
        const count = pendingCounts[actor.id] || 0;
        if (!count && !actor.runtime_confirmation_required) return null;
        const name = actor.title?.trim() || actor.id;
        return (
          <div
            key={actor.id}
            className="office-canvas__attention"
            ref={(element) => {
              if (element) attentionRefs.current.set(actor.id, element);
              else attentionRefs.current.delete(actor.id);
            }}
          >
            {count ? (
              <button
                type="button"
                data-office-pending-actor={actor.id}
                aria-label={t("animationOffice.pendingActor", { name, count })}
                onClick={() => onPendingActor?.(actor.id)}
              >
                {t("animationOffice.pendingBadge", { count })}
              </button>
            ) : null}
            {actor.runtime_confirmation_required ? (
              <button
                type="button"
                data-office-terminal-confirmation={actor.id}
                aria-label={t("animationOffice.terminalConfirmActor", { name })}
                onClick={() => onSelect(actor.id)}
              >
                {t("animationOffice.terminalConfirm")}
              </button>
            ) : null}
          </div>
        );
      })}
      {error ? (
        <div className="office-canvas__notice" role="status">
          {t("animationOffice.loadError")}
        </div>
      ) : null}
    </div>
  );
}
