"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useSessionStore } from "@/providers/store-provider";

interface Props {
  onPinClick: (pinId: string) => void;
  onTestAddPin?: (meshName: string) => void;
  readOnly?: boolean;
}

export function PinListPanel({ onPinClick, onTestAddPin, readOnly = false }: Props) {
  const t = useTranslations("session");
  const tTypes = useTranslations("painTypes");

  const { session } = useSessionStore((state) => state);
  const painPoints = session?.painPoints ?? [];

  const getRatingBadgeColor = (rating: number) => {
    if (rating <= 3) return "bg-green-500 hover:bg-green-600 text-white";
    if (rating <= 6) return "bg-yellow-500 hover:bg-yellow-600 text-white";
    return "bg-red-500 hover:bg-red-600 text-white";
  };

  return (
    <div className="w-80 border-r flex flex-col bg-background">
      {onTestAddPin && !readOnly && (
        <div className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onTestAddPin("hand-right")}
          >
            Add pin on right hand
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {painPoints.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground text-center">
            {readOnly ? "No pain points recorded" : t("clickToAdd")}
          </div>
        ) : (
          <div className="space-y-2">
            {painPoints.map((point) => (
              <Card
                key={point.id}
                className={`p-3 transition-colors duration-200 ${
                  readOnly ? "" : "cursor-pointer hover:bg-accent/50"
                }`}
                onClick={readOnly ? undefined : () => onPinClick(point.id)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {point.label}
                      </h3>
                      <h4 className="font-medium text-sm truncate">
                        {tTypes(point.type)}
                      </h4>
                      <Badge
                        className={`${getRatingBadgeColor(point.rating)} text-xs px-2 py-0 flex-shrink-0`}
                      >
                        {point.rating}
                      </Badge>
                    </div>
                    {point.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {point.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}