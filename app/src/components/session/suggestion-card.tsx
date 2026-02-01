"use client";

import { Lightbulb } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

interface SuggestionCardProps {
  title: string;
  onClick: () => void;
}

export function SuggestionCard({ title, onClick }: SuggestionCardProps) {
  return (
    <Card
      className={cn(
        "p-2.5 transition-all duration-200 cursor-pointer",
        "hover:bg-accent/50 hover:shadow-sm",
        "border-l-2 border-l-yellow-500/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
        <p className="text-xs font-medium line-clamp-2 leading-relaxed">
          {title}
        </p>
      </div>
    </Card>
  );
}