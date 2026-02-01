"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface SuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export function SuggestionDialog({
  open,
  onOpenChange,
  title,
  description,
}: SuggestionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md mt-2">
          💡 You can answer this question using the message input below the 3D model.
        </div>
      </DialogContent>
    </Dialog>
  );
}