"use client";

import { useEffect } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListPanel } from "./pin-list-panel";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/providers/store-provider";
import type { PainPoint } from "@/types/TPainPoint";

interface Props {
  token: string;
  sessionTitle: string | null;
  initialPainPoints: PainPoint[];
}

export function SharedSessionView({
  token,
  sessionTitle,
  initialPainPoints,
}: Props) {
  const { setSession, setLoading, setHistory } = useSessionStore((state) => state);

  const { data: session, isLoading } = api.session.getByShareToken.useQuery(
    { token },
    {
      initialData: {
        id: "", // Not needed for shared view
        title: sessionTitle,
        painPoints: initialPainPoints,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  const sessionId = session?.id ?? "";
  const { data: history } = api.session.getHistory.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

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

  const latestNotes = history?.[history.length - 1]?.notes ?? "";

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 bg-background z-10">
        <h1 className="text-xl font-semibold">{sessionTitle} (Read-only)</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <PinListPanel 
          onPinClick={() => {}} // No-op
          onTestAddPin={() => {}} // No-op
          readOnly
        />

        <div className="flex-1 relative">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
            <p className="text-sm text-muted-foreground/60 max-w-md px-4">
              You are viewing a shared pain report. Drag to rotate the model.
            </p>
          </div>

          <BodyViewer
            sessionId={sessionId}
            onPinClick={() => {}}
            targetMesh={null}
            setTargetMesh={() => {}}
            readOnly
          />
        </div>

        <div className="w-80 border-l flex flex-col bg-background">
          <Textarea
            readOnly
            value={latestNotes}
            placeholder="No notes available"
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 rounded-none"
          />
        </div>
      </div>
    </div>
  );
}