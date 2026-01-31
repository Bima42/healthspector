# Planning: Application de Mapping de Douleurs sur Modèle 3D Humain

## Situation Actuelle

**Projet:** Application hackathon pour visualiser et documenter des douleurs corporelles via un modèle 3D interactif.

**Stack confirmée:**

- Next.js 16 avec App Router
- **tRPC** (déjà configuré)
- Drizzle ORM (configuré, DB dans `src/server/db/`)
- Tailwind v4
- next-intl pour i18n
- Docker pour dev/prod

**État:** Base fonctionnelle avec tRPC, routing i18n, et structure serveur en place.

---

## Le Problème qu'on Résout

Permettre à un utilisateur de **localiser précisément ses douleurs** sur un modèle anatomique 3D, puis de les **documenter** avec des labels et (plus tard) via conversation vocale.

---

## Architecture Proposée

### Flow Utilisateur (MVP)

```
Landing (/) → [Bouton "Nouvelle session"] → /session/[id]
                                                   ↓
                                         Canvas 3D avec modèle humain
                                                   ↓
                                         Clic sur le corps → Pin
                                                   ↓
                                         Panel latéral pour éditer label/notes
                                                   ↓
                                         Sauvegarde auto via tRPC
```

### Structure de Fichiers - Ajouts Nécessaires

```
src/
├── app/
│   ├── [locale]/                  # Déjà existant
│   │   ├── page.tsx               # Landing - MODIFIER
│   │   ├── session/               # CRÉER
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Vue principale 3D
│   │   └── layout.tsx             # Déjà existant
│   └── api/
│       └── trpc/                  # Déjà configuré
│
├── components/
│   ├── landing/                   # Déjà existant
│   │   └── hero.tsx               # MODIFIER - ajouter CTA
│   ├── session/                   # CRÉER
│   │   ├── body-viewer.tsx        # Container Canvas R3F
│   │   ├── human-model.tsx        # Mesh 3D humain
│   │   ├── pain-pin.tsx           # Pin 3D + label
│   │   ├── pin-editor-panel.tsx   # UI sidebar pour éditer
│   │   └── session-header.tsx     # Header avec actions
│   └── ui/                        # shadcn components - INSTALLER

├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   └── session.ts         # CRÉER - tRPC router sessions
│   │   ├── root.ts                # MODIFIER - ajouter sessionRouter
│   │   └── trpc.ts                # Déjà existant
│   └── db/
│       ├── schema/
│       │   ├── index.ts           # MODIFIER - exporter tout
│       │   ├── sessions.ts        # CRÉER
│       │   └── pain-points.ts     # CRÉER
│       ├── index.ts               # Déjà existant
│       └── migrate.ts             # Déjà existant
│
├── lib/
│   ├── stores/                    # CRÉER
│   │   └── session-store.ts       # Zustand pour state client
│   └── trpc/                      # Déjà existant
│
└── messages/
    ├── en.json                    # MODIFIER - ajouter clés
    └── fr.json                    # MODIFIER - ajouter clés
```

---

## Phases d'Exécution

### Phase 1: Setup Base & Schema (20min)

#### 1.1 Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei zustand
npm install -D @types/three
```

#### 1.2 Créer Schemas DB

**Fichier:** `src/server/db/schema/sessions.ts`

```ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

**Fichier:** `src/server/db/schema/pain-points.ts`

```ts
import { pgTable, uuid, text, timestamp, real } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";

export const painPoints = pgTable("pain_points", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),

  // Position 3D (coordonnées sur le modèle)
  posX: real("pos_x").notNull(),
  posY: real("pos_y").notNull(),
  posZ: real("pos_z").notNull(),

  // Contenu
  label: text("label").notNull().default(""),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PainPoint = typeof painPoints.$inferSelect;
export type NewPainPoint = typeof painPoints.$inferInsert;
```

**Fichier:** `src/server/db/schema/index.ts`

```ts
export * from "./sessions";
export * from "./pain-points";
```

#### 1.3 Migrer la DB

```bash
npm run db:push  # ou la commande configurée pour Drizzle
```

---

### Phase 2: Backend tRPC (30min)

#### 2.1 Créer Session Router

**Fichier:** `src/server/api/routers/session.ts`

```ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sessions, painPoints } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const sessionRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .insert(sessions)
        .values({ title: input.title || "Nouvelle session" })
        .returning();
      return session;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, input.id),
        with: {
          painPoints: true,
        },
      });
      return session;
    }),

  addPainPoint: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }),
        label: z.string().default(""),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [point] = await ctx.db
        .insert(painPoints)
        .values({
          sessionId: input.sessionId,
          posX: input.position.x,
          posY: input.position.y,
          posZ: input.position.z,
          label: input.label,
        })
        .returning();
      return point;
    }),

  updatePainPoint: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        label: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(painPoints)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(painPoints.id, id))
        .returning();
      return updated;
    }),

  deletePainPoint: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(painPoints).where(eq(painPoints.id, input.id));
      return { success: true };
    }),
});
```

**Note:** Il faudra aussi définir les relations dans le schema pour que `with: { painPoints: true }` fonctionne.

#### 2.2 Ajouter au Root Router

**Fichier:** `src/server/api/root.ts` (MODIFIER)

```ts
import { sessionRouter } from "./routers/session";

export const appRouter = createTRPCRouter({
  // ... autres routers existants
  session: sessionRouter,
});
```

---

### Phase 3: State Management Client (15min)

**Fichier:** `src/lib/stores/session-store.ts`

```ts
import { create } from "zustand";

export interface PainPin {
  id: string;
  position: [number, number, number];
  label: string;
  notes?: string;
}

interface SessionStore {
  selectedPinId: string | null;

  selectPin: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  selectedPinId: null,

  selectPin: (id) => set({ selectedPinId: id }),
  clearSelection: () => set({ selectedPinId: null }),
}));
```

**Note:** On utilise Zustand uniquement pour l'état UI temporaire. Les données viennent de tRPC.

---

### Phase 4: UI Flow - Landing & Routes (20min)

#### 4.1 Modifier Landing Page

**Fichier:** `src/app/[locale]/page.tsx`

```tsx
import { Hero } from "@/components/landing/hero";
import { redirect } from "next/navigation";
import { api } from "@/lib/trpc/server";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  async function createSession() {
    "use server";
    const session = await api.session.create({ title: "Nouvelle session" });
    redirect(`/${params.locale}/session/${session.id}`);
  }

  return (
    <main>
      <Hero />
      <form action={createSession}>
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-6 py-3 rounded"
        >
          Commencer une nouvelle session
        </button>
      </form>
    </main>
  );
}
```

#### 4.2 Créer Session Page

**Fichier:** `src/app/[locale]/session/[id]/page.tsx`

```tsx
import { BodyViewer } from "@/components/session/body-viewer";
import { api } from "@/lib/trpc/server";
import { notFound } from "next/navigation";

export default async function SessionPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const session = await api.session.getById({ id: params.id });

  if (!session) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-semibold">{session.title}</h1>
      </header>
      <BodyViewer
        sessionId={session.id}
        initialPainPoints={session.painPoints}
      />
    </div>
  );
}
```

---

### Phase 5: Composants UI Session (30min)

#### 5.1 Pin Editor Panel

**Fichier:** `src/components/session/pin-editor-panel.tsx`

```tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { useSessionStore } from "@/lib/stores/session-store";

export function PinEditorPanel({ sessionId }: { sessionId: string }) {
  const selectedPinId = useSessionStore((s) => s.selectedPinId);
  const utils = api.useUtils();

  const updateMutation = api.session.updatePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
    },
  });

  const deleteMutation = api.session.deletePainPoint.useMutation({
    onSuccess: () => {
      utils.session.getById.invalidate({ id: sessionId });
      useSessionStore.getState().clearSelection();
    },
  });

  if (!selectedPinId) {
    return (
      <div className="w-80 border-l p-4 bg-muted/30">
        <p className="text-muted-foreground text-sm">
          Cliquez sur le modèle pour ajouter un point
        </p>
      </div>
    );
  }

  // Récupérer le point depuis tRPC query
  const { data: session } = api.session.getById.useQuery({ id: sessionId });
  const point = session?.painPoints.find((p) => p.id === selectedPinId);

  if (!point) return null;

  return (
    <div className="w-80 border-l p-4 flex flex-col gap-4">
      <input
        defaultValue={point.label}
        placeholder="Label de la douleur"
        onBlur={(e) =>
          updateMutation.mutate({
            id: point.id,
            label: e.target.value,
          })
        }
        className="px-3 py-2 border rounded"
      />

      <textarea
        defaultValue={point.notes || ""}
        placeholder="Notes additionnelles..."
        onBlur={(e) =>
          updateMutation.mutate({
            id: point.id,
            notes: e.target.value,
          })
        }
        className="px-3 py-2 border rounded min-h-32"
      />

      <button
        onClick={() => deleteMutation.mutate({ id: point.id })}
        className="bg-destructive text-destructive-foreground px-4 py-2 rounded"
      >
        Supprimer
      </button>
    </div>
  );
}
```

---

### Phase 6: Composants 3D de Base (45min)

**Note:** On commence avec un placeholder simple (cube/sphère) pour tester le flow.

#### 6.1 Body Viewer Container

**Fichier:** `src/components/session/body-viewer.tsx`

```tsx
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
    { initialData: { painPoints: initialPainPoints } as any },
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

          {session?.painPoints.map((point) => (
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
```

#### 6.2 Human Model Placeholder

**Fichier:** `src/components/session/human-model.tsx`

```tsx
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
```

#### 6.3 Pain Pin Component

**Fichier:** `src/components/session/pain-pin.tsx`

```tsx
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
```

---

### Phase 7: Polish & Finalisation (temps restant)

#### 7.1 Ajout Messages i18n

**Fichiers:** `src/messages/fr.json` et `src/messages/en.json`

```json
{
  "session": {
    "new": "Nouvelle session",
    "create": "Commencer",
    "title": "Titre de la session",
    "clickToAdd": "Cliquez sur le modèle pour ajouter un point",
    "labelPlaceholder": "Label de la douleur",
    "notesPlaceholder": "Notes additionnelles...",
    "delete": "Supprimer"
  }
}
```

#### 7.2 Responsive & Styling

- Stack vertical sur mobile (Canvas au-dessus, panel en dessous)
- Améliorer les boutons/inputs
- Ajouter loading states

#### 7.3 Relations DB pour `with`

**Dans:** `src/server/db/schema/sessions.ts`

```ts
import { relations } from "drizzle-orm";
import { painPoints } from "./pain-points";

export const sessionsRelations = relations(sessions, ({ many }) => ({
  painPoints: many(painPoints),
}));
```

**Dans:** `src/server/db/schema/pain-points.ts`

```ts
import { relations } from "drizzle-orm";
import { sessions } from "./sessions";

export const painPointsRelations = relations(painPoints, ({ one }) => ({
  session: one(sessions, {
    fields: [painPoints.sessionId],
    references: [sessions.id],
  }),
}));
```

---

### Phase 8: Modèle 3D Réel (À LA FIN)

#### 8.1 Trouver un Modèle

Sources recommandées:

- **Sketchfab** (chercher "human body base mesh", filtrer par licence gratuite)
- **Mixamo** (personnages riggés)
- **Free3D**, **CGTrader**

Format: `.glb` ou `.gltf` (préférer `.glb`, c'est binaire et plus léger)

#### 8.2 Ajouter au Projet

```bash
# Créer dossier
mkdir -p public/models

# Placer le fichier
# public/models/human-body.glb
```

#### 8.3 Charger avec useGLTF

**Modifier:** `src/components/session/human-model.tsx`

```tsx
import { useGLTF } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";

interface Props {
  onClick: (position: [number, number, number]) => void;
}

export function HumanModel({ onClick }: Props) {
  const { scene } = useGLTF("/models/human-body.glb");

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const { x, y, z } = event.point;
    onClick([x, y, z]);
  };

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

// Preload pour éviter le flicker
useGLTF.preload("/models/human-body.glb");
```

#### 8.4 Ajustements

- Positionner/scaler le modèle correctement
- Ajuster la caméra initiale
- Potentiellement corriger l'orientation (rotation Y)
- Vérifier que les clics fonctionnent bien sur le mesh

---

## Checklist Finale

### MVP Fonctionnel

- [ ] Créer session depuis landing
- [ ] Afficher modèle 3D (placeholder puis réel)
- [ ] Cliquer pour ajouter pin
- [ ] Éditer label/notes du pin sélectionné
- [ ] Supprimer pin
- [ ] Persistance DB via tRPC
- [ ] UI responsive

### Nice-to-Have (si temps)

- [ ] Loading states
- [ ] Animations (pins qui apparaissent)
- [ ] Liste des sessions
- [ ] Couleur des pins par intensité
- [ ] Export/print de la session

---

## Points d'Attention

1. **Relations Drizzle:** Bien exporter les `relations` depuis `schema/index.ts`
2. **tRPC invalidation:** Toujours invalider les queries après mutation
3. **HTML overlays:** Le `Html` de Drei peut causer des perf issues avec beaucoup de pins (>50)
4. **Modèle 3D:** Tester avec placeholder d'abord, modèle réel EN DERNIER
5. **Docker:** Vérifier que Three.js build correctement en prod
