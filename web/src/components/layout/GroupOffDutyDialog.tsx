import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export function GroupOffDutyDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: { title: string } | null | undefined;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation("layout");
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        className="w-[min(calc(100vw-1.5rem),28rem)] p-5"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancel.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("groupRun.confirmOffDutyTitle", { group: target?.title })}</DialogTitle>
          <DialogDescription className="leading-6">
            {t("groupRun.confirmOffDutyDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button ref={cancel} variant="outline" onClick={onCancel}>
            {t("groupRun.keepWorking")}
          </Button>
          <Button onClick={onConfirm}>{t("groupRun.confirmOffDuty")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
