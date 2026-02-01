"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect } from "react";
import { scanPredefinedPainPoints } from "../../lib/gltf-scanner";
import { useSessionStore } from "../../providers/store-provider";

interface Props {
  onClick: (position: [number, number, number]) => void;
  targetMesh?: string | null;
  onMeshPositionFound?: (position: [number, number, number]) => void;
}

export function HumanModel({ onClick, targetMesh, onMeshPositionFound }: Props) {
  const { scene } = useGLTF("/medias/3d/final_3d_model.glb");
  
  const { setPredefinedPainPoints, predefinedPainPointsLoaded } = useSessionStore((state) => state);
  
  useEffect(() => {
    if (!predefinedPainPointsLoaded) {
      const points = scanPredefinedPainPoints(scene);
      setPredefinedPainPoints(points);
    }
  }, [scene, predefinedPainPointsLoaded, setPredefinedPainPoints]);

  useEffect(() => {
    if (!targetMesh || !onMeshPositionFound) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === targetMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox!.getCenter(center);
        mesh.localToWorld(center);
        onMeshPositionFound([center.x, center.y, center.z]);
      }
    });
  }, [scene, targetMesh, onMeshPositionFound]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const { x, y, z } = event.point;
    console.log("Clicked mesh:", event.object.name, "at", [x, y, z]);
    onClick([x, y, z]);
  };

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      scale={0.01}
      position={[0, -1, 0]}
    />
  );
}