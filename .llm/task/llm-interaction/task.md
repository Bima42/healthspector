# 📋 Plan d'implémentation - Système AI pour pain points prédéfinis

## 1️⃣ Compréhension du besoin

### **Objectif principal**
Permettre à l'IA (via OpenRouter Structured Output) de créer/éditer des pain points en utilisant des zones prédéfinies du modèle 3D.

### **Contraintes validées**
✅ Pas de nouveau store → Utiliser `sessionStore` existant  
✅ Scanner dynamiquement le GLTF (convention de nommage inconnue)  
✅ Router AI séparé (`ai-router.ts`)  
✅ Override complet de session (pas de merge)  
✅ Résolution mesh → position côté client via Three.js  
✅ Validation Zod (équivalent Pydantic)  

### **Flow global confirmé**
```
User message → LLM génère AISessionUpdate → Client résout mesh names 
→ API applique update → Store mis à jour → UI reflète
```

---

## 2️⃣ Information manquante (avec solutions proposées)

### 🚨 **Problème critique : Comment filtrer les mesh "targets" ?**

**Contexte** : Le GLTF contient potentiellement des dizaines de mesh (corps, vêtements, etc.). Comment identifier lesquels sont des "pain point targets" ?

**Solutions proposées** :

#### **Option A (Recommandée) : Pattern matching sur les noms**
```ts
// On suppose que les targets ont des noms explicites
const TARGET_PATTERNS = [
  /hand/i,
  /foot/i,
  /arm/i,
  /leg/i,
  // Extensible selon les besoins
];

function isPainTarget(meshName: string): boolean {
  return TARGET_PATTERNS.some(pattern => pattern.test(meshName));
}
```

#### **Option B : Blacklist du mesh principal**
```ts
// On exclut les mesh du corps principal
const EXCLUDED_NAMES = ["Body", "Skin", "Armature", "Root"];

function isPainTarget(meshName: string): boolean {
  return !EXCLUDED_NAMES.includes(meshName) && meshName.trim() !== "";
}
```

#### **Option C : Logging pour découverte manuelle**
```ts
// On log TOUS les mesh au premier chargement
console.log("All GLTF meshes:", allMeshNames);
// L'utilisateur choisit ensuite lesquels activer
```

**🎯 Je propose d'implémenter Option A + logging pour debug**, avec possibilité d'ajuster le pattern ultérieurement.

---

## 3️⃣ Approche détaillée

### **Étape 1 : Scanner le GLTF et stocker les targets**

#### **Fichier : `src/lib/gltf-scanner.ts`** (nouveau)

```ts
import * as THREE from "three";

export interface DiscoveredMeshTarget {
  name: string;              // "hand-right"
  position: [number, number, number];
  label: string;             // "Right Hand" (généré auto)
  category?: string;         // "upper-extremity" (généré auto)
}

// Pattern pour identifier les targets
const TARGET_PATTERNS = [/hand/i, /foot/i];

export function scanPainTargets(scene: THREE.Group): DiscoveredMeshTarget[] {
  const targets: DiscoveredMeshTarget[] = [];
  const allMeshes: string[] = [];
  
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    
    allMeshes.push(mesh.name); // Pour debug
    
    // Filtre : doit matcher un pattern
    const isTarget = TARGET_PATTERNS.some(p => p.test(mesh.name));
    if (!isTarget) return;
    
    // Calculer position
    mesh.geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    mesh.geometry.boundingBox!.getCenter(center);
    mesh.localToWorld(center);
    
    targets.push({
      name: mesh.name,
      position: [center.x, center.y, center.z],
      label: generateLabel(mesh.name),
      category: inferCategory(mesh.name),
    });
  });
  
  console.log("📦 All GLTF meshes:", allMeshes);
  console.log("🎯 Pain targets found:", targets);
  
  return targets;
}

// "hand-right" → "Right Hand"
function generateLabel(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .reverse()
    .join(' ');
}

// "hand-right" → "upper-extremity"
function inferCategory(name: string): string {
  if (/hand|arm|shoulder/i.test(name)) return "upper-extremity";
  if (/foot|leg|knee/i.test(name)) return "lower-extremity";
  return "other";
}
```

**Logique** :
- Traverse tout le scene graph
- Filtre les mesh par pattern
- Calcule les positions (bounding box center en world coords)
- Génère des labels/catégories automatiquement

---

#### **Fichier : `src/stores/session-store.ts`** (modifier)

```ts
export interface SessionStoreState {
  session: SessionWithPainPoints | null;
  isLoading: boolean;
  selectedPinId: string | null;
  historySlots: SessionHistorySlot[];
  
  // ✨ NOUVEAU : Mesh targets découverts
  meshTargets: DiscoveredMeshTarget[];
  meshTargetsLoaded: boolean;
  
  // ... actions existantes
  
  // ✨ NOUVELLES actions
  setMeshTargets: (targets: DiscoveredMeshTarget[]) => void;
  getMeshTarget: (name: string) => DiscoveredMeshTarget | undefined;
}

// Implémentation
setMeshTargets: (targets) => {
  set({ meshTargets: targets, meshTargetsLoaded: true });
},

getMeshTarget: (name) => {
  return get().meshTargets.find(t => t.name === name);
},
```

**Pourquoi dans sessionStore ?**
- Évite de créer un nouveau store (demande de l'utilisateur)
- Les targets sont spécifiques au modèle 3D chargé (lié à la session)
- Permet un accès facile depuis tous les composants

---

#### **Fichier : `src/components/session/human-model.tsx`** (modifier)

```tsx
import { useEffect, forwardRef, useImperativeHandle } from "react";
import { scanPainTargets } from "@/lib/gltf-scanner";
import { useSessionStore } from "@/providers/store-provider";

export interface HumanModelRef {
  lookupMeshPosition: (meshName: string) => Promise<[number, number, number]>;
}

export const HumanModel = forwardRef<HumanModelRef, Props>(
  ({ onClick, targetMesh, onMeshPositionFound }, ref) => {
    const { scene } = useGLTF("/medias/3d/test_obvious_mesh.glb");
    const setMeshTargets = useSessionStore((state) => state.setMeshTargets);
    
    // ✨ Scanner au montage (une seule fois)
    useEffect(() => {
      const targets = scanPainTargets(scene);
      setMeshTargets(targets);
    }, [scene, setMeshTargets]);
    
    // ✨ Exposer fonction de lookup pour résolution dynamique
    useImperativeHandle(ref, () => ({
      lookupMeshPosition: async (meshName: string) => {
        return new Promise((resolve, reject) => {
          let found = false;
          
          scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && child.name === meshName) {
              const mesh = child as THREE.Mesh;
              mesh.geometry.computeBoundingBox();
              const center = new THREE.Vector3();
              mesh.geometry.boundingBox!.getCenter(center);
              mesh.localToWorld(center);
              found = true;
              resolve([center.x, center.y, center.z]);
            }
          });
          
          if (!found) {
            reject(new Error(`Mesh "${meshName}" not found`));
          }
        });
      },
    }));
    
    // useEffect existant pour targetMesh (inchangé)
    useEffect(() => {
      if (!targetMesh || !onMeshPositionFound) return;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name === targetMesh) {
          // ... code existant
        }
      });
    }, [scene, targetMesh, onMeshPositionFound]);
    
    // Reste du composant (onClick, render) inchangé
    return <primitive object={scene} onClick={handleClick} scale={0.01} position={[0, -1, 0]} />;
  }
);
```

**Changements** :
1. Import du scanner
2. Appel du scanner au mount → stockage dans store
3. Exposition de `lookupMeshPosition` via ref (pour résolution à la demande)

---

### **Étape 2 : Validation Zod pour l'IA**

#### **Fichier : `src/types/TAISessionUpdate.ts`** (nouveau)

```ts
import { z } from "zod";

/**
 * Schema pour un pain point généré par l'IA
 * L'IA peut spécifier soit un meshName (zone prédéfinie), soit une position (point existant)
 */
export const aiPainPointSchema = z.object({
  // Option 1 : Zone prédéfinie
  meshName: z.string().optional(),
  
  // Option 2 : Position explicite (pour garder un point existant)
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  
  // Données obligatoires
  label: z.string().min(1, "Label requis"),
  type: z.enum([
    "sharp", "dull", "burning", "tingling", 
    "throbbing", "cramping", "shooting", "other"
  ]),
  notes: z.string().optional(),
  rating: z.number().int().min(0).max(10),
}).refine(
  (data) => data.meshName || data.position,
  { message: "Soit meshName soit position doit être fourni" }
);

/**
 * Schema pour l'update complet d'une session par l'IA
 */
export const aiSessionUpdateSchema = z.object({
  notes: z.string().optional(),           // Description globale (undefined = pas d'update)
  painPoints: z.array(aiPainPointSchema), // [] = pas d'update, [...] = override complet
});

export type AIPainPoint = z.infer<typeof aiPainPointSchema>;
export type AISessionUpdate = z.infer<typeof aiSessionUpdateSchema>;
```

**Logique** :
- Chaque point peut avoir `meshName` OU `position` (validation via `.refine`)
- Si `painPoints` est vide `[]` → pas de modification des points
- Si `painPoints` a des éléments → suppression + recréation complète

---

### **Étape 3 : Router AI dédié**

#### **Fichier : `src/server/api/routers/ai-router.ts`** (nouveau)

```ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sessions, painPoints, painTypeEnum, sessionHistory } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const aiRouter = createTRPCRouter({
  /**
   * Applique un update généré par l'IA sur une session
   * Override complet : supprime tous les anciens points et crée les nouveaux
   */
  applySessionUpdate: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        userMessage: z.string(),
        update: z.object({
          notes: z.string().optional(),
          painPoints: z.array(
            z.object({
              position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
              label: z.string(),
              type: z.enum(painTypeEnum.enumValues),
              notes: z.string().optional(),
              rating: z.number().int().min(0).max(10),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionId, userMessage, update } = input;

      // 1. Si painPoints non vide, override complet
      if (update.painPoints.length > 0) {
        // Supprimer tous les anciens points
        await ctx.db.delete(painPoints).where(eq(painPoints.sessionId, sessionId));

        // Créer les nouveaux points
        await ctx.db.insert(painPoints).values(
          update.painPoints.map((point) => ({
            sessionId,
            posX: point.position.x,
            posY: point.position.y,
            posZ: point.position.z,
            label: point.label,
            type: point.type,
            notes: point.notes ?? null,
            rating: point.rating,
          }))
        );
      }

      // 2. Récupérer l'état actuel pour l'historique
      const currentPainPoints = await ctx.db.query.painPoints.findMany({
        where: eq(painPoints.sessionId, sessionId),
      });

      const existingSlots = await ctx.db.query.sessionHistory.findMany({
        where: eq(sessionHistory.sessionId, sessionId),
      });

      // 3. Créer un history slot
      const [slot] = await ctx.db
        .insert(sessionHistory)
        .values({
          sessionId,
          painPoints: currentPainPoints,
          notes: update.notes ?? null,
          userMessage,
          index: existingSlots.length,
        })
        .returning();

      // 4. Retourner la session mise à jour
      const session = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: { painPoints: true },
      });

      return { session, historySlot: slot };
    }),
});
```

**Logique** :
1. Si `painPoints.length > 0` → DELETE all + INSERT new
2. Si `painPoints.length === 0` → Pas de modification des points
3. Création systématique d'un history slot
4. Retourne session complète + history slot créé

---

#### **Fichier : `src/server/api/root.ts`** (modifier)

```ts
import { sessionRouter } from './routers/session-router';
import { aiRouter } from './routers/ai-router'; // ✨ NOUVEAU
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  session: sessionRouter,
  ai: aiRouter, // ✨ NOUVEAU
});

export type AppRouter = typeof appRouter;
```

---

### **Étape 4 : Helper de résolution mesh → position**

#### **Fichier : `src/lib/mesh-resolver.ts`** (nouveau)

```ts
import type { AIPainPoint } from "@/types/TAISessionUpdate";

export interface ResolvedPainPoint {
  position: { x: number; y: number; z: number };
  label: string;
  type: string;
  notes?: string;
  rating: number;
}

/**
 * Résout les mesh names en positions concrètes
 * Doit être appelé côté client avec accès au HumanModelRef
 */
export async function resolveMeshPositions(
  painPoints: AIPainPoint[],
  lookupFn: (meshName: string) => Promise<[number, number, number]>
): Promise<ResolvedPainPoint[]> {
  const resolved: ResolvedPainPoint[] = [];

  for (const point of painPoints) {
    let position: { x: number; y: number; z: number };

    if (point.meshName) {
      // Résolution via GLTF lookup
      const [x, y, z] = await lookupFn(point.meshName);
      position = { x, y, z };
    } else if (point.position) {
      // Position déjà fournie (point existant conservé)
      position = point.position;
    } else {
      throw new Error("Point must have either meshName or position");
    }

    resolved.push({
      position,
      label: point.label,
      type: point.type,
      notes: point.notes,
      rating: point.rating,
    });
  }

  return resolved;
}
```

**Usage** : Transforme `AIPainPoint[]` (avec mesh names) en `ResolvedPainPoint[]` (avec positions).

---

### **Étape 5 : Intégration dans SessionView**

#### **Fichier : `src/components/session/session-view.tsx`** (modifier)

```tsx
import { useRef } from "react";
import type { HumanModelRef } from "./human-model";
import { resolveMeshPositions } from "@/lib/mesh-resolver";
import type { AISessionUpdate } from "@/types/TAISessionUpdate";

export function SessionView({ sessionId, sessionTitle, initialPainPoints }: Props) {
  // ... state existant
  
  const humanModelRef = useRef<HumanModelRef>(null);
  
  // ✨ Mutation pour appliquer un update IA
  const applyAIUpdateMutation = api.ai.applySessionUpdate.useMutation({
    onSuccess: ({ session, historySlot }) => {
      setSession(session);
      addHistorySlot(historySlot);
    },
  });
  
  // ✨ Fonction pour traiter un update de l'IA
  const handleAIUpdate = async (aiUpdate: AISessionUpdate, userMessage: string) => {
    try {
      // 1. Résoudre les mesh names → positions
      const resolvedPoints = await resolveMeshPositions(
        aiUpdate.painPoints,
        async (meshName) => {
          if (!humanModelRef.current) {
            throw new Error("3D model not ready");
          }
          return humanModelRef.current.lookupMeshPosition(meshName);
        }
      );
      
      // 2. Appeler l'API avec positions résolues
      applyAIUpdateMutation.mutate({
        sessionId,
        userMessage,
        update: {
          notes: aiUpdate.notes,
          painPoints: resolvedPoints,
        },
      });
    } catch (error) {
      console.error("Failed to apply AI update:", error);
      // TODO: Afficher erreur à l'utilisateur
    }
  };
  
  // handleSubmit existant (inchangé pour l'instant)
  
  return (
    <div className="h-screen flex flex-col">
      {/* ... header */}
      
      <div className="flex-1 flex overflow-hidden">
        <PinListPanel ... />
        
        <div className="flex-1 relative">
          <BodyViewer
            sessionId={sessionId}
            onPinClick={handlePinClick}
            targetMesh={targetMesh}
            setTargetMesh={setTargetMesh}
            ref={humanModelRef} // ✨ NOUVEAU : Passage de ref
          />
          
          {/* MessageInput existant */}
        </div>
        
        {/* Panel notes existant */}
      </div>
      
      {/* EditPinDialog existant */}
    </div>
  );
}
```

**Note** : Il faudra aussi modifier `BodyViewer` pour forward la ref vers `HumanModel`.

---

#### **Fichier : `src/components/session/body-viewer.tsx`** (modifier)

```tsx
import { forwardRef } from "react";
import type { HumanModelRef } from "./human-model";

interface Props {
  sessionId: string;
  onPinClick: (pinId: string) => void;
  targetMesh: string | null;
  setTargetMesh: (mesh: string | null) => void;
}

export const BodyViewer = forwardRef<HumanModelRef, Props>(
  ({ sessionId, onPinClick, targetMesh, setTargetMesh }, ref) => {
    // ... reste du code existant
    
    return (
      <>
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
            {/* ... lights */}
            
            <Suspense fallback={null}>
              <HumanModel
                ref={ref} // ✨ Forward ref
                onClick={handleModelClick}
                targetMesh={targetMesh}
                onMeshPositionFound={(pos) => {
                  setTargetMesh(null);
                  handleModelClick(pos);
                }}
              />
            </Suspense>
            
            {/* ... pain pins, controls */}
          </Canvas>
        </div>
        
        {/* AddPinDialog existant */}
      </>
    );
  }
);
```

---

### **Étape 6 : Connection avec OpenRouter (hors scope pour l'instant)**

**À implémenter ultérieurement** :
- Fonction `callOpenRouterAI(prompt, meshTargets, currentPainPoints)` qui retourne `AISessionUpdate`
- Intégration dans le `handleSubmit` de `SessionView`
- Parsing et validation de la réponse avec `aiSessionUpdateSchema.parse()`

**Pour l'instant** : On expose juste `handleAIUpdate()` qui pourra être appelé quand l'IA sera connectée.

---

## 4️⃣ Récapitulatif des fichiers

### ✨ **Nouveaux fichiers (5)**

1. **`src/lib/gltf-scanner.ts`**
   - Fonction `scanPainTargets(scene)` → `DiscoveredMeshTarget[]`
   - Helpers `generateLabel()`, `inferCategory()`

2. **`src/types/TAISessionUpdate.ts`**
   - Schemas Zod : `aiPainPointSchema`, `aiSessionUpdateSchema`
   - Types : `AIPainPoint`, `AISessionUpdate`

3. **`src/lib/mesh-resolver.ts`**
   - Fonction `resolveMeshPositions(painPoints, lookupFn)` → `ResolvedPainPoint[]`

4. **`src/server/api/routers/ai-router.ts`**
   - Mutation `applySessionUpdate`

5. **`src/types/TPredefinedMesh.ts`** (optionnel, pour export du type)
   - Type `DiscoveredMeshTarget`

### 🔧 **Fichiers modifiés (5)**

1. **`src/stores/session-store.ts`**
   - Ajout state : `meshTargets`, `meshTargetsLoaded`
   - Ajout actions : `setMeshTargets`, `getMeshTarget`

2. **`src/components/session/human-model.tsx`**
   - Appel scanner au mount
   - Forward ref + `useImperativeHandle` pour `lookupMeshPosition`

3. **`src/components/session/body-viewer.tsx`**
   - Forward ref vers `HumanModel`

4. **`src/components/session/session-view.tsx`**
   - Ref `humanModelRef`
   - Fonction `handleAIUpdate()`
   - Mutation `applyAIUpdateMutation`

5. **`src/server/api/root.ts`**
   - Import et ajout `ai: aiRouter`

---

## 5️⃣ Ordre d'implémentation suggéré

1. **Créer `gltf-scanner.ts`** et **modifier `session-store.ts`**
   → Permet de tester le scan directement

2. **Modifier `human-model.tsx`** pour appeler scanner + exposer ref
   → Vérifier dans console que les mesh sont bien détectés

3. **Créer `TAISessionUpdate.ts`** avec schemas Zod
   → Tester la validation localement

4. **Créer `ai-router.ts`** et modifier `root.ts`
   → Endpoint disponible pour tests

5. **Créer `mesh-resolver.ts`**
   → Helper de transformation

6. **Modifier `body-viewer.tsx`** et **`session-view.tsx`**
   → Intégration complète côté client

7. **Tests manuels** avec un objet mock `AISessionUpdate`
   → Vérifier le flow end-to-end

---

## 6️⃣ Point de validation

### **Pattern matching pour filtrer les mesh**

Le scanner utilisera :
```ts
const TARGET_PATTERNS = [/hand/i, /foot/i];
```

Si vos mesh ne matchent pas ce pattern, il faudra ajuster. Les logs console montreront tous les mesh disponibles pour faciliter l'ajustement.

### **Alternative si aucun pattern ne fonctionne**

Créer un fichier de config temporaire :
```ts
// src/config/mesh-targets.ts
export const KNOWN_TARGETS = [
  "hand-right", "hand-left", "foot-right", "foot-left"
];
```

Et filtrer explicitement :
```ts
const isTarget = KNOWN_TARGETS.includes(mesh.name);
```
