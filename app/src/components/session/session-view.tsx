"use client";

import { useEffect, useState } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListPanel } from "./pin-list-panel";
import { EditPinDialog } from "./edit-pin-dialog";
import { MessageInput } from "./message-input";
import { Textarea } from "../ui/textarea";
import { ShareButton } from "./share-button";
import { api } from "../../lib/trpc/client";
import { useSessionStore } from "../../providers/store-provider";
import type { PainPoint } from "../../types/TPainPoint";

interface Props {
  sessionId: string;
  sessionTitle: string | null;
  initialPainPoints: PainPoint[];
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function SessionView({
  sessionId,
  sessionTitle,
  initialPainPoints,
}: Props) {
  const { setSession, setLoading, selectedPinId, selectPin, setHistory, addHistorySlot, predefinedPainPoints } = useSessionStore((state) => state);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [targetMesh, setTargetMesh] = useState<string | null>(null);

  const { data: session, isLoading } = api.session.getById.useQuery(
    { id: sessionId },
    {
      initialData: {
        id: sessionId,
        title: sessionTitle,
        painPoints: initialPainPoints,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  const { data: history } = api.session.getHistory.useQuery({ sessionId });

  const processMessageMutation = api.ai.processMessage.useMutation({
    onSuccess: ({ session: updatedSession, historySlot }) => {
      if (updatedSession) {
        setSession(updatedSession);
      }
      addHistorySlot(historySlot);
      setNotes(historySlot.notes ?? "");
    },
  });

  const transcribeMutation = api.speech.transcribe.useMutation();

  useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (history) {
      setHistory(history);
    }
  }, [history, setHistory]);

  const handlePinClick = (pinId: string) => {
    selectPin(pinId);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      selectPin(null);
    }
  };

  const handleTestAddPin = (meshName: string) => {
    setTargetMesh(meshName);
  };

  const handleTranscribeAudio = async (blob: Blob): Promise<string> => {
    try {
      // Convert Blob to base64 data URL
      const base64Data = await blobToBase64(blob);
      
      // Call the transcription mutation
      const result = await transcribeMutation.mutateAsync({
        audioData: base64Data,
      });
      
      // Return the transcribed text
      return result.text;
    } catch (error) {
      console.error("[SessionView] Transcription error:", error);
      // Return empty string on error to avoid breaking the UI
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    processMessageMutation.mutate({
      sessionId,
      userMessage: input,
      predefinedPoints: predefinedPainPoints,
    });

    setInput("");
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 bg-background z-10 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{sessionTitle}</h1>
        <ShareButton sessionId={sessionId} />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <PinListPanel 
          onPinClick={handlePinClick}
          onTestAddPin={handleTestAddPin}
        />

        <div className="flex-1 relative">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
            <p className="text-sm text-muted-foreground/60 max-w-md px-4">
              Click on the body to mark where you feel pain. You can rotate the model by dragging.
            </p>
          </div>

          <BodyViewer
            sessionId={sessionId}
            onPinClick={handlePinClick}
            targetMesh={targetMesh}
            setTargetMesh={setTargetMesh}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
            <form onSubmit={handleSubmit}>
              <MessageInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                isGenerating={processMessageMutation.isPending}
                transcribeAudio={handleTranscribeAudio}
                submitOnEnter={true}
              />
            </form>
          </div>
        </div>

        <div className="w-80 border-l flex flex-col bg-background">
          <Textarea
            placeholder="Describe what's wrong..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 rounded-none"
          />
        </div>
      </div>

      <EditPinDialog
        open={isEditDialogOpen}
        onOpenChange={handleEditDialogClose}
        sessionId={sessionId}
        painPointId={selectedPinId}
      />
    </div>
  );
}