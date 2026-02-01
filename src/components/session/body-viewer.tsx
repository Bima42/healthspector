"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { HumanModel } from "./human-model";
import { PainPin } from "./pain-pin";
import { AddPinDialog } from "./add-pin-dialog";
import { useSessionStore } from "@/providers/store-provider";
import { useState } from "react";

interface Props {
  sessionId: string;
  onPinClick: (pinId: string) => void;
  targetMesh: string | null;
  setTargetMesh: (mesh: string | null) => void;
  readOnly?: boolean;
}

export function BodyViewer({ 
  sessionId, 
  onPinClick,
  targetMesh,
  setTargetMesh,
  readOnly = false,
}: Props) {

  const { session } = useSessionStore((state) => state);
  const painPoints = session?.painPoints ?? [];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  const handleModelClick = (position: [number, number, number]) => {
    if (readOnly) return;
    setPendingPosition({ x: position[0], y: position[1], z: position[2] });
    setIsAddDialogOpen(true);
  };

  return (
    <>
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          <Suspense fallback={null}>
            <HumanModel
              onClick={handleModelClick}
              targetMesh={targetMesh}
              onMeshPositionFound={(pos) => {
                setTargetMesh(null);
                handleModelClick(pos);
              }}
            />
          </Suspense>

          {painPoints.map((point) => (
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