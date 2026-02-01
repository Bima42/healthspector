"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/trpc/client";

interface Props {
  sessionId: string;
}

export function ShareButton({ sessionId }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const createShareMutation = api.session.createShare.useMutation({
    onSuccess: (data) => {
      console.log("✅ Share created:", data);
    },
    onError: (error) => {
      console.error("❌ Share creation failed:", error);
    },
  });

  // Trigger mutation when dialog opens
  useEffect(() => {
    if (open && !createShareMutation.data && !createShareMutation.isPending) {
      console.log("🚀 Triggering mutation with sessionId:", sessionId);
      createShareMutation.mutate({ sessionId });
    }
  }, [open, sessionId, createShareMutation]);

  const shareUrl =
    createShareMutation.data?.token
      ? `${window.location.origin}/shared/${createShareMutation.data.token}`
      : "";

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setCopied(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        title="Share session"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this session</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your pain points in read-only mode.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="flex-1"
              placeholder={
                createShareMutation.isPending 
                  ? "Generating link..." 
                  : createShareMutation.isError
                  ? "Error generating link"
                  : ""
              }
            />
            <Button
              onClick={handleCopy}
              disabled={!shareUrl}
              variant="secondary"
              size="icon"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          {createShareMutation.isError && (
            <p className="text-sm text-destructive mt-2">
              {createShareMutation.error.message}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}