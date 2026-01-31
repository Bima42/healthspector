"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/lib/stores/session-store";

export function PinEditorPanel({ sessionId }: { sessionId: string }) {
  // ALL HOOKS AT THE TOP - must be called unconditionally
  const selectedPinId = useSessionStore((s) => s.selectedPinId);
  const utils = api.useUtils();

  const updateMutation = api.session.updatePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
    },
  });

  const deleteMutation = api.session.deletePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
      useSessionStore.getState().clearSelection();
    },
  });

  // Use enabled option to only fetch when a pin is selected
  const { data: session } = api.session.getById.useQuery(
    { id: sessionId },
    { enabled: !!selectedPinId }
  );

  const point = session?.painPoints?.find((p) => p.id === selectedPinId);

  // Local state for controlled inputs
  const [label, setLabel] = useState(point?.label ?? "");
  const [notes, setNotes] = useState(point?.notes ?? "");

  // Update local state when point changes
  useEffect(() => {
    if (point) {
      setLabel(point.label ?? "");
      setNotes(point.notes ?? "");
    }
  }, [point?.id, point?.label, point?.notes]);

  // NOW we can do conditional rendering
  if (!selectedPinId || !point) {
    return null;
  }

  return (
    <div className="p-4 border-t flex flex-col gap-4">
      <div className="text-sm font-medium">Éditer le point</div>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label de la douleur"
        onBlur={(e) =>
          updateMutation.mutate({
            id: point.id,
            label: e.target.value,
          })
        }
        className="px-3 py-2 border rounded"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes additionnelles..."
        onBlur={(e) =>
          updateMutation.mutate({
            id: point.id,
            notes: e.target.value,
          })
        }
        className="px-3 py-2 border rounded min-h-24"
      />

      <button
        onClick={() => deleteMutation.mutate({ id: point.id })}
        className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90"
      >
        Supprimer
      </button>
    </div>
  );
}
