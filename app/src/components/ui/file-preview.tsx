"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";

import { Button } from "./button";
import { cn } from "../../lib/utils";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const isImage = file.type.startsWith("image/");
  const isText = file.type.startsWith("text/");

  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const content = reader.result as string;
        setTextContent(content.slice(0, 100)); // First 100 chars
      };
      reader.readAsText(file);
    }
  }, [file, isImage, isText]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0"
    >
      <div
        className={cn(
          "relative h-20 w-20 overflow-hidden rounded-lg border bg-muted",
          isImage && "border-primary/20"
        )}
      >
        {isImage && preview ? (
          <img
            src={preview}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-2">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <p className="mt-1 text-[10px] text-muted-foreground truncate w-full text-center">
              {file.name}
            </p>
          </div>
        )}

        {isText && textContent && (
          <div className="absolute inset-0 bg-background/95 p-2">
            <p className="text-[8px] leading-tight text-muted-foreground line-clamp-6">
              {textContent}
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        size="icon"
        variant="destructive"
        className="absolute -right-2 -top-2 h-5 w-5 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
}