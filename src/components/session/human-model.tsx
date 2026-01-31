"use client";

import { ThreeEvent } from "@react-three/fiber";

interface Props {
  onClick: (position: [number, number, number]) => void;
}

export function HumanModel({ onClick }: Props) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const { x, y, z } = event.point;
    onClick([x, y, z]);
  };

  // PLACEHOLDER: Capsule simple pour tester
  // Le vrai modèle sera ajouté en Phase 7
  return (
    <mesh onClick={handleClick} position={[0, 1, 0]}>
      <capsuleGeometry args={[0.3, 1.2, 16, 32]} />
      <meshStandardMaterial color="#e0e0e0" />
    </mesh>
  );
}
