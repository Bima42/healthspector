"use client";

import { useEffect, useState } from "react";
import { BodyViewer } from "./body-viewer";
import { PinListPanel } from "./pin-list-panel";
import { ViewPinDialog } from "./view-pin-dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { api } from "../../lib/trpc/client";
import { useSessionStore } from "../../providers/store-provider";
import type { PainPoint } from "../../types/TPainPoint";
import { Home } from "lucide-react";
import Link from "next/link";

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
        id: "",
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
    if (session) setSession(session);
  }, [session, setSession]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (history) setHistory(history);
  }, [history, setHistory]);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePinClick = (pinId: string) => {
    setSelectedPinId(pinId);
    setDialogOpen(true);
  };

  const latestNotes = history?.[history.length - 1]?.notes ?? "";

  return (
    <div className="h-screen flex flex-col">
      <header className="px-4 py-3 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between shadow-sm">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        
        <h1 className="text-sm font-medium text-muted-foreground">
          {sessionTitle} <span className="text-xs">(Read-only)</span>
        </h1>
        
        <div className="w-8" />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <PinListPanel
          onPinClick={handlePinClick}
        />

        <div className="flex-1 relative">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
            <p className="text-sm text-muted-foreground/60 max-w-md px-4">
              Viewing shared report. Drag to rotate.
            </p>
          </div>

          <BodyViewer
            sessionId={sessionId}
            onPinClick={handlePinClick}
            targetMesh={null}
            setTargetMesh={() => {}}
            readOnly
          />
        </div>

        <div className="w-80 flex flex-col bg-background shadow-md">
          <div className="p-3">
            <span className="text-sm font-medium text-muted-foreground">Notes</span>
          </div>
          <Textarea
            readOnly
            value={latestNotes}
            placeholder="No notes available"
            className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 rounded-none"
          />
        </div>
      </div>
      <ViewPinDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        painPointId={selectedPinId}
      />
    </div>
  );
}