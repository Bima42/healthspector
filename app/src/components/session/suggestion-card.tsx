"use client";

import { cn } from "../../lib/utils";

interface SuggestionCardProps {
  title: string;
  onClick: () => void;
}

export function SuggestionCard({ title, onClick }: SuggestionCardProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-all duration-200",
        "bg-card shadow-sm hover:shadow-md",
        "hover:bg-accent/5"
      )}
      onClick={onClick}
    >
      <p className="text-sm leading-relaxed">{title}</p>
    </div>
  );
}