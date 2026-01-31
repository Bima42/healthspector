"use client";

import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/lib/stores/session-store";

export function PinEditorPanel({ sessionId }: { sessionId: string }) {
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

  if (!selectedPinId) {
    return (
      <div className="w-80 border-l p-4 bg-muted/30">
        <p className="text-muted-foreground text-sm">
          Cliquez sur le modèle pour ajouter un point
        </p>
      </div>
    );
  }

  // Récupérer le point depuis tRPC query
  const { data: session } = api.session.getById.useQuery({ id: sessionId });
  const point = session?.painPoints?.find((p) => p.id === selectedPinId);

  if (!point) return null;

  return (
    <div className="w-80 border-l p-4 flex flex-col gap-4">
      <input
        defaultValue={point.label}
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
        defaultValue={point.notes || ""}
        placeholder="Notes additionnelles..."
        onBlur={(e) =>
          updateMutation.mutate({
            id: point.id,
            notes: e.target.value,
          })
        }
        className="px-3 py-2 border rounded min-h-32"
      />

      <button
        onClick={() => deleteMutation.mutate({ id: point.id })}
        className="bg-destructive text-destructive-foreground px-4 py-2 rounded"
      >
        Supprimer
      </button>
    </div>
  );
}
