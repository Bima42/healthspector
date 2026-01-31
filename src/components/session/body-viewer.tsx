"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HumanModel } from "./human-model";
import { PainPin } from "./pain-pin";
import { PinEditorPanel } from "./pin-editor-panel";
import { api } from "@/lib/trpc/client";
import type { PainPoint } from "@/server/db/schema";
import { useSessionStore } from "@/lib/stores/session-store";

interface Props {
  sessionId: string;
  initialPainPoints: PainPoint[];
}

export function BodyViewer({ sessionId, initialPainPoints }: Props) {
  const { data: session } = api.session.getById.useQuery(
    { id: sessionId },
    {
      initialData: {
        id: sessionId,
        title: null,
        painPoints: initialPainPoints,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
  );

  const utils = api.useUtils();
  const addPainMutation = api.session.addPainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
    },
  });

  const handleModelClick = (position: [number, number, number]) => {
    addPainMutation.mutate({
      sessionId,
      position: { x: position[0], y: position[1], z: position[2] },
    });
  };

  const selectedPinId = useSessionStore((s) => s.selectedPinId);

  return (
    <div className="flex-1 flex">
      <div className="flex-1">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          <HumanModel onClick={handleModelClick} />

          {session?.painPoints?.map((point) => (
            <PainPin
              key={point.id}
              point={point}
              isSelected={point.id === selectedPinId}
            />
          ))}

          <OrbitControls enablePan={false} minDistance={1.5} maxDistance={5} />
        </Canvas>
      </div>

      <PinEditorPanel sessionId={sessionId} />
    </div>
  );
}
