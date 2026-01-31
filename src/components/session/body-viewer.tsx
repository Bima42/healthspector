"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HumanModel } from "./human-model";
import { PainPin } from "./pain-pin";
import { AddPinDialog } from "./add-pin-dialog";
import { api } from "@/lib/trpc/client";
import type { PainPoint } from "@/server/db/schema";

interface Props {
  sessionId: string;
  initialPainPoints: PainPoint[];
  onPinClick: (pinId: string) => void;
}

export function BodyViewer({ sessionId, initialPainPoints, onPinClick }: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

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

  const handleModelClick = (position: [number, number, number]) => {
    setPendingPosition({ x: position[0], y: position[1], z: position[2] });
    setIsAddDialogOpen(true);
  };

  return (
    <>
      <div className="flex-1">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          <Suspense fallback={null}>
            <HumanModel onClick={handleModelClick} />
          </Suspense>

          {session?.painPoints?.map((point) => (
            <PainPin key={point.id} point={point} onEdit={onPinClick} />
          ))}

          <OrbitControls enablePan={false} minDistance={1.5} maxDistance={5} />
        </Canvas>
      </div>

      <AddPinDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        sessionId={sessionId}
        position={pendingPosition}
      />
    </>
  );
}
