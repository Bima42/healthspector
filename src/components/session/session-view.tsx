"use client";

import { useState } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListSidebar } from "./pin-list-sidebar";
import { EditPinDialog } from "./edit-pin-dialog";
import { MessageInput } from "@/components/ui/message-input";
import { transcribeAudio } from "@/lib/audio-utils";
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
  const [input, setInput] = useState("");

  const handlePinClick = (pinId: string) => {
    setEditingPinId(pinId);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <PinListSidebar sessionId={sessionId} onPinClick={handlePinClick}>
        <div className="h-full flex flex-col relative">
          <header className="border-b p-4 bg-background z-10">
            <h1 className="text-xl font-semibold">{sessionTitle}</h1>
          </header>
          
          <BodyViewer
            sessionId={sessionId}
            initialPainPoints={initialPainPoints}
            onPinClick={handlePinClick}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Message submitted:", input);
                setInput("");
              }}
            >
              <MessageInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                isGenerating={false}
                transcribeAudio={transcribeAudio}
                submitOnEnter={true}
              />
            </form>
          </div>
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