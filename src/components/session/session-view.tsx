"use client";

import { useState } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListSidebar } from "./pin-list-sidebar";
import { EditPinDialog } from "./edit-pin-dialog";
import type { PainPoint } from "@/server/db/schema";

interface Props {
  sessionId: string;
  sessionTitle: string | null;
  initialPainPoints: PainPoint[];
}

export function SessionView({
  sessionId,
  sessionTitle,
  initialPainPoints,
}: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);

  const handlePinClick = (pinId: string) => {
    setEditingPinId(pinId);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <PinListSidebar sessionId={sessionId} onPinClick={handlePinClick}>
        <div className="h-full flex flex-col">
          <header className="border-b p-4 bg-background z-10">
            <h1 className="text-xl font-semibold">{sessionTitle}</h1>
          </header>
          <BodyViewer
            sessionId={sessionId}
            initialPainPoints={initialPainPoints}
            onPinClick={handlePinClick}
          />
        </div>
      </PinListSidebar>

      <EditPinDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sessionId={sessionId}
        painPointId={editingPinId}
      />
    </>
  );
}
