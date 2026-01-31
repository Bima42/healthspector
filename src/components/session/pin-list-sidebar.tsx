"use client";

import { api } from "@/lib/trpc/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface Props {
  sessionId: string;
  children: React.ReactNode;
  onPinClick: (pinId: string) => void;
}

export function PinListSidebar({ sessionId, children, onPinClick }: Props) {
  const { data: session } = api.session.getById.useQuery({ id: sessionId });

  const painPoints = session?.painPoints ?? [];

  const getRatingBadgeColor = (rating: number) => {
    if (rating <= 3) return "bg-green-500 hover:bg-green-600 text-white";
    if (rating <= 6) return "bg-yellow-500 hover:bg-yellow-600 text-white";
    return "bg-red-500 hover:bg-red-600 text-white";
  };

  return (
    <SidebarProvider>
      <SidebarInset>{children}</SidebarInset>

      <Sidebar side="right">
        <SidebarHeader>
          <h2 className="px-4 py-2 text-lg font-semibold">Points de douleur</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Points enregistrés ({painPoints.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {painPoints.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  Cliquez sur le modèle 3D pour ajouter un point de douleur
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  {painPoints.map((point, index) => (
                    <button
                      key={point.id}
                      onClick={() => onPinClick(point.id)}
                      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm truncate">
                              {point.label || `Point ${index + 1}`}
                            </h3>
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
                    </button>
                  ))}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
