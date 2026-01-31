"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/trpc/client";

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
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState([5]);

  const utils = api.useUtils();

  const addPainMutation = api.session.addPainPoint.useMutation({
    onSuccess: () => {
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
      label: label || "Point de douleur",
      notes,
      rating: rating[0] ?? 5,
    });
  };

  const handleClose = () => {
    setLabel("");
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
            <DialogTitle>Ajouter un point de douleur</DialogTitle>
            <DialogDescription>
              Décrivez la douleur et évaluez son intensité.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
              <Label htmlFor="notes">Description</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rating">Intensité de la douleur</Label>
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
                <span>Aucune douleur (0)</span>
                <span>Douleur maximale (10)</span>
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
              Annuler
            </Button>
            <Button type="submit" disabled={addPainMutation.isPending}>
              {addPainMutation.isPending ? "Enregistrement..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
