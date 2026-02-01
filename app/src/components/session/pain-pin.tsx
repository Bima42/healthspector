"use client";

import { useState } from "react";
import type { PainPoint } from "../../types/TPainPoint";

interface Props {
  point: PainPoint;
  onEdit: (pinId: string) => void;
}

export function PainPin({ point, onEdit }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const position: [number, number, number] = [
    point.posX,
    point.posY,
    point.posZ,
  ];

  const getPinColor = (rating: number) => {
    if (rating <= 3) return { base: "#22c55e", emissive: "#16a34a" }; // green
    if (rating <= 6) return { base: "#eab308", emissive: "#ca8a04" }; // yellow
    return { base: "#ef4444", emissive: "#dc2626" }; // red
  };

  const colors = getPinColor(point.rating);

  return (
    <group position={position}>
      {/* Pin 3D */}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onEdit(point.id);
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={colors.base}
          emissive={colors.emissive}
          emissiveIntensity={isHovered ? 0.8 : 0.5}
        />
      </mesh>

      {/* Label overlay - show on hover or selection */}
      {/* {showLabel && (
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
      )} */}
    </group>
  );
}
