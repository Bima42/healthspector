"use client";

import { useEffect, useState } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListPanel } from "./pin-list-panel";
import { EditPinDialog } from "./edit-pin-dialog";
import { MessageInput } from "./message-input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ShareButton } from "./share-button";
import { api } from "../../lib/trpc/client";
import { useSessionStore } from "../../providers/store-provider";
import type { PainPoint } from "../../types/TPainPoint";
import { Save } from "lucide-react";

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
  const [notesDirty, setNotesDirty] = useState(false);
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
      setNotesDirty(false);
    },
  });

  const saveNotesMutation = api.session.createHistorySlot.useMutation({
    onSuccess: (slot) => {
      addHistorySlot(slot);
      setNotesDirty(false);
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

  useEffect(() => {
    if (history && history.length > 0) {
      if (!notesDirty) {
        const latestNotes = history[history.length - 1]?.notes ?? "";
        setNotes(latestNotes);
      }
    }
  }, [history]);

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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setNotesDirty(true);
  };

  const handleSaveNotes = () => {
    if (!notes.trim()) return;
    saveNotesMutation.mutate({
      sessionId,
      userMessage: "[ACTION] Updated notes",
      notes,
    });
  };

  const handleTranscribeAudio = async (blob: Blob): Promise<string> => {
    try {
      const base64Data = await blobToBase64(blob);
      const result = await transcribeMutation.mutateAsync({
        audioData: base64Data,
      });
      return result.text;
    } catch (error) {
      console.error("[SessionView] Transcription error:", error);
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
          <div className="p-2 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Notes</span>
            <Button
              size="sm"
              variant={notesDirty ? "default" : "ghost"}
              onClick={handleSaveNotes}
              disabled={!notesDirty || saveNotesMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {saveNotesMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <Textarea
            placeholder="Describe what's wrong..."
            value={notes}
            onChange={handleNotesChange}
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