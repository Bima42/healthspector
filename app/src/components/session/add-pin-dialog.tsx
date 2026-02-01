"use client";

import { useState } from "react";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { api } from "../../lib/trpc/client";
import { useSessionStore } from "../../providers/store-provider";
import { PAIN_TYPES, type PainType } from "../../types/TPainPoint";

interface AddPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  position: { x: number; y: number; z: number } | null;
}

export function AddPinDialog({
  open,
  onOpenChange,
  sessionId,
  position,
}: AddPinDialogProps) {
  const t = useTranslations("painDialog");
  const tTypes = useTranslations("painTypes");

  const { addPainPoint} = useSessionStore((state) => state);

  const [label, setLabel] = useState("");
  const [type, setType] = useState<PainType>("other");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState([5]);

  const utils = api.useUtils();

  const addPainMutation = api.session.addPainPoint.useMutation({
    onSuccess: (newPoint) => {
      addPainPoint(newPoint);
      
      // Invalidate query to keep cache in sync
      utils.session.getById.invalidate({ id: sessionId });
      
      handleClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return;

    addPainMutation.mutate({
      sessionId,
      position,
      label: label || "",
      type,
      notes,
      rating: rating[0] ?? 5,
    });
  };

  const handleClose = () => {
    setLabel("");
    setType("other");
    setNotes("");
    setRating([5]);
    onOpenChange(false);
  };

  const getRatingColor = (value: number) => {
    if (value <= 3) return "text-green-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("addTitle")}</DialogTitle>
            <DialogDescription>{t("addDescription")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">{t("typeLabel")}</Label>
              <Select value={type} onValueChange={(v) => setType(v as PainType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAIN_TYPES.map((key) => (
                    <SelectItem key={key} value={key}>
                      {tTypes(key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="label">Titre</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Douleur au dos"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">{t("notesLabel")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("addDescription")}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rating">{t("intensityLabel")}</Label>
                <span
                  className={`text-2xl font-bold ${getRatingColor(rating[0] ?? 5)}`}
                >
                  {rating[0]}
                </span>
              </div>
              <Slider
                id="rating"
                min={0}
                max={10}
                step={1}
                value={rating}
                onValueChange={setRating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("intensityMin")}</span>
                <span>{t("intensityMax")}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addPainMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={addPainMutation.isPending}>
              {addPainMutation.isPending ? t("saving") : t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}