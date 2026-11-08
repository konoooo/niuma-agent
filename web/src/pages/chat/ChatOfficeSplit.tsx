import { lazy, Suspense, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import type { Actor } from "../../types";
import "./chatOfficeSplit.css";

const OfficeAnimationView = lazy(() =>
  import("./animation/OfficeAnimationView").then((module) => ({
    default: module.OfficeAnimationView,
  })),
);

type Props = {
  groupId: string;
  actors: Actor[];
  showAnimation: boolean;
  onInspectActor: (actorId: string) => void;
  onOpenPending: (eventId: string) => void;
  children: ReactNode;
};

export function ChatOfficeSplit({
  groupId,
  actors,
  showAnimation,
  onInspectActor,
  onOpenPending,
  children,
}: Props) {
  const { t } = useTranslation("chat");
  return (
    <div className="chat-office-split" data-chat-office-split>
      <div className="chat-office-split__layout">
        {showAnimation ? (
          <div className="chat-office-split__scene" data-group-animation-view="visible">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="p-4 text-sm text-[var(--color-text-muted)]">
                    {t("workView.loading")}
                  </div>
                }
              >
                <OfficeAnimationView
                  groupId={groupId}
                  actors={actors}
                  onInspectActor={onInspectActor}
                  onOpenPending={onOpenPending}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        ) : null}
        <div className="chat-office-split__conversation" data-chat-office-conversation>
          {children}
        </div>
      </div>
    </div>
  );
}
