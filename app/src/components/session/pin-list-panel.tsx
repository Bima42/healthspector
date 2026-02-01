"use client";

import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";
import { useSessionStore } from "../../providers/store-provider";
import { SuggestionsPanel } from "./suggestion-panel";
import { cn } from "../../lib/utils";

interface Props {
  onPinClick: (pinId: string) => void;
  onTestAddPin?: (meshName: string) => void;
  readOnly?: boolean;
}

export function PinListPanel({ onPinClick, readOnly = false }: Props) {
  const t = useTranslations("session");
  const tTypes = useTranslations("painTypes");

  const { session } = useSessionStore((state) => state);
  const painPoints = session?.painPoints ?? [];

  const getRatingColor = (rating: number) => {
    if (rating <= 3) return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (rating <= 6) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  };

  return (
    <div className="w-80 flex flex-col bg-background shadow-md">
      <div className="flex-1 overflow-y-auto p-3">
        {painPoints.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">
            {readOnly ? "No pain points recorded" : t("clickToAdd")}
          </div>
        ) : (
          <div className="space-y-2">
            {painPoints.map((point) => (
              <div
                key={point.id}
                className={cn(
                  "p-3 transition-colors duration-200 cursor-pointer hover:bg-accent/50",
                  !readOnly && "cursor-pointer hover:shadow-md hover:bg-accent/5"
                )}
                onClick={readOnly ? undefined : () => onPinClick(point.id)}
              >
                <h3 className="font-medium text-sm mb-2">{point.label}</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {tTypes(point.type)}
                  </Badge>
                  <Badge className={cn("text-xs font-medium", getRatingColor(point.rating))}>
                    {point.rating}/10
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!readOnly && <SuggestionsPanel />}
    </div>
  );
}