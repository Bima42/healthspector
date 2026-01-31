"use client";

import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/lib/stores/session-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { PinEditorPanel } from "./pin-editor-panel";

interface Props {
  sessionId: string;
  children: React.ReactNode;
}

export function PinListSidebar({ sessionId, children }: Props) {
  const { data: session } = api.session.getById.useQuery({ id: sessionId });
  const selectedPinId = useSessionStore((s) => s.selectedPinId);
  const selectPin = useSessionStore((s) => s.selectPin);

  const painPoints = session?.painPoints ?? [];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="px-4 py-2 text-lg font-semibold">Points de douleur</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Points ({painPoints.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {painPoints.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Cliquez sur le modèle pour ajouter un point
                  </div>
                ) : (
                  painPoints.map((point, index) => (
                    <SidebarMenuItem key={point.id}>
                      <SidebarMenuButton
                        isActive={point.id === selectedPinId}
                        onClick={() => selectPin(point.id)}
                      >
                        <span>
                          {point.label || `Point ${index + 1}`}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {selectedPinId && (
          <SidebarFooter>
            <PinEditorPanel sessionId={sessionId} />
          </SidebarFooter>
        )}
      </Sidebar>

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
