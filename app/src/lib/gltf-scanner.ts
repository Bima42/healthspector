import * as THREE from "three";
import type { PredefinedPainPoint } from "../types/TPainPoint";

/**
 * Pattern to identify pain point targets
 * We exclude the main body mesh (Ch36) and only keep markers
 */
const TARGET_PATTERNS = [/hand/i, /foot/i, /back/i, /head/i, /torso/i];

/**
 * Scans a GLTF scene and logs all available meshes
 * This is a discovery tool to understand the model structure
 */
export function discoverAllMeshes(scene: THREE.Group): void {
  const meshes: Array<{
    name: string;
    type: string;
    hasGeometry: boolean;
    vertexCount: number;
  }> = [];

  console.log("🔍 Starting GLTF mesh discovery...");

  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      
      meshes.push({
        name: mesh.name || "(unnamed)",
        type: mesh.type,
        hasGeometry: !!mesh.geometry,
        vertexCount: mesh.geometry?.attributes?.position?.count || 0,
      });
    }
  });

  console.log("📦 Total meshes found:", meshes.length);
  console.table(meshes);
  
  console.log("📋 Mesh names only:");
  meshes.forEach((m, index) => {
    console.log(`  ${index + 1}. "${m.name}"`);
  });
}

/**
 * Scans the GLTF scene for predefined pain point locations
 * Filters out the main body mesh and calculates positions
 */
export function scanPredefinedPainPoints(scene: THREE.Group): PredefinedPainPoint[] {
  const painPoints: PredefinedPainPoint[] = [];
  
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    
    // Filter: must match one of the target patterns
    const isTarget = TARGET_PATTERNS.some(pattern => pattern.test(mesh.name));
    if (!isTarget) return;
    
    // Calculate bounding box center in world coordinates
    mesh.geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    mesh.geometry.boundingBox!.getCenter(center);
    mesh.localToWorld(center);
    
    painPoints.push({
      name: mesh.name,
      position: [center.x, center.y, center.z],
      label: generateLabel(mesh.name),
      category: inferCategory(mesh.name),
    });
  });
  
  console.log("🎯 Predefined pain points discovered:", painPoints.length);
  console.table(painPoints);
  
  return painPoints;
}

/**
 * Converts mesh name to human-readable label
 * Examples:
 * - "hand-right" → "Right Hand"
 * - "foot-left" → "Left Foot"
 */
function generateLabel(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .reverse()
    .join(' ');
}

/**
 * Infers anatomical category from mesh name
 * Used for organizing targets in the UI
 */
function inferCategory(name: string): string {
  if (/hand|arm|shoulder|elbow|wrist/i.test(name)) {
    return "upper-extremity";
  }
  if (/foot|leg|knee|ankle|hip/i.test(name)) {
    return "lower-extremity";
  }
  if (/head|neck|face/i.test(name)) {
    return "head-neck";
  }
  if (/chest|back|abdomen|torso/i.test(name)) {
    return "trunk";
  }
  return "other";
}