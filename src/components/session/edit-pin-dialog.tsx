"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/lib/stores/session-store";

interface EditPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  painPointId: string | null;
}

export function EditPinDialog({
  open,
  onOpenChange,
  sessionId,
  painPointId,
}: EditPinDialogProps) {
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState([5]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const utils = api.useUtils();
  const clearSelection = useSessionStore((s) => s.clearSelection);

  const { data: session } = api.session.getById.useQuery(
    { id: sessionId },
    { enabled: open && !!painPointId }
  );

  const point = session?.painPoints?.find((p) => p.id === painPointId);

  useEffect(() => {
    if (point) {
      setLabel(point.label ?? "");
      setNotes(point.notes ?? "");
      setRating([point.rating ?? 5]);
    }
  }, [point]);

  const updateMutation = api.session.updatePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
      onOpenChange(false);
    },
  });

  const deleteMutation = api.session.deletePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
      clearSelection();
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!painPointId) return;

    updateMutation.mutate({
      id: painPointId,
      label: label || "Point de douleur",
      notes,
      rating: rating[0] ?? 5,
    });
  };

  const handleDelete = () => {
    if (!painPointId) return;
    deleteMutation.mutate({ id: painPointId });
    setShowDeleteAlert(false);
  };

  const getRatingColor = (value: number) => {
    if (value <= 3) return "text-green-500";
    if (value <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  if (!point) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Modifier le point de douleur</DialogTitle>
              <DialogDescription>
                Mise à jour de la description et de l&apos;intensité.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-label">Titre</Label>
                <Input
                  id="edit-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Douleur au dos"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Description</Label>
                <Textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-rating">Intensité de la douleur</Label>
                  <span
                    className={`text-2xl font-bold ${getRatingColor(rating[0] ?? 5)}`}
                  >
                    {rating[0]}
                  </span>
                </div>
                <Slider
                  id="edit-rating"
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

              <div className="text-xs text-muted-foreground">
                Créé le{" "}
                {new Date(point.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAlert(true)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
                className="sm:mr-auto"
              >
                Supprimer
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le point de douleur sera
              définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
