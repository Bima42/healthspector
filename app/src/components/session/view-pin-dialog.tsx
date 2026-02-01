"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useSessionStore } from "../../providers/store-provider";
import { Badge } from "../ui/badge";

interface ViewPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  painPointId: string | null;
}

export function ViewPinDialog({
  open,
  onOpenChange,
  painPointId,
}: ViewPinDialogProps) {
  const t = useTranslations("painDialog");
  const tTypes = useTranslations("painTypes");

  const { session } = useSessionStore((state) => state);
  const point = session?.painPoints?.find((p) => p.id === painPointId);

  const getRatingColor = (value: number) => {
    if (value <= 3) return "text-green-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  if (!point) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{point.label || t("editTitle")}</DialogTitle>
          <DialogDescription>{t("editDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label className="text-muted-foreground">{t("typeLabel")}</Label>
            <p className="text-sm">{tTypes(point.type)}</p>
          </div>

          {point.notes && (
            <div className="grid gap-1">
              <Label className="text-muted-foreground">{t("notesLabel")}</Label>
              <p className="text-sm whitespace-pre-wrap">{point.notes}</p>
            </div>
          )}

          <div className="grid gap-1">
            <Label className="text-muted-foreground">{t("intensityLabel")}</Label>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getRatingColor(point.rating)}`}>
                {point.rating}
              </span>
              <Badge
                className={`${
                  point.rating <= 3
                    ? "bg-green-500 text-white"
                    : point.rating <= 6
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                }`}
              >
                {point.rating <= 3
                  ? t("intensityMin")
                  : point.rating <= 6
                    ? "Moderate"
                    : t("intensityMax")}
              </Badge>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {t("createdAt")}{" "}
            {new Date(point.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
