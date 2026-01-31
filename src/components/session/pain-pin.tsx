"use client";

import { Html } from "@react-three/drei";
import { useSessionStore } from "@/lib/stores/session-store";
import type { PainPoint } from "@/server/db/schema";

interface Props {
  point: PainPoint;
  isSelected: boolean;
}

export function PainPin({ point, isSelected }: Props) {
  const selectPin = useSessionStore((s) => s.selectPin);

  const position: [number, number, number] = [
    point.posX,
    point.posY,
    point.posZ,
  ];

  return (
    <group position={position}>
      {/* Pin 3D */}
      <mesh onClick={() => selectPin(point.id)}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ef4444" : "#f97316"}
          emissive={isSelected ? "#dc2626" : "#ea580c"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Label overlay */}
      <Html
        position={[0, 0.08, 0]}
        center
        distanceFactor={8}
        occlude
        style={{ pointerEvents: "none" }}
      >
        <div className="bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap border">
          {point.label || "Sans titre"}
        </div>
      </Html>
    </group>
  );
}
