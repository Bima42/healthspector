# The Local — Pain Mapping Application

## Overview

**The Local** is a medical pain-tracking application that allows users to mark and describe pain points on an interactive 3D human body model. Users can either manually place pins or describe their pain in natural language, and an AI assistant will interpret and map the pain points automatically.

---

## Tech Stack

| Layer                | Technology                     |
| -------------------- | ------------------------------ |
| Framework            | Next.js 15 (App Router)        |
| API                  | tRPC v11                       |
| Database             | PostgreSQL + Drizzle ORM       |
| State Management     | Zustand                        |
| 3D Rendering         | Three.js + React Three Fiber   |
| LLM                  | (configurable via `llmInvoke`) |
| Internationalization | next-intl                      |
| UI Components        | shadcn/ui + Tailwind CSS       |

---

## Core Concepts

### Session

A session represents a single pain-mapping consultation. Each session has:

- A title
- Multiple pain points
- A history of interactions (for LLM context)
- Optional share tokens for read-only access

### Pain Point

A pain point is a marker on the 3D body with:

- **Position**: 3D coordinates (x, y, z)
- **Label**: User-defined name
- **Type**: Category of pain (sharp, dull, burning, tingling, throbbing, cramping, shooting, other)
- **Rating**: Intensity scale 0-10
- **Notes**: Additional description

### Session History

A chronological log of all session interactions. Each slot contains:

- Snapshot of all pain points at that moment
- User message or action description
- AI-generated notes (if applicable)
- Timestamp and index

History serves as **context for the LLM** so it understands what happened throughout the session.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client                                │
├─────────────────────────────────────────────────────────────────┤
│  SessionView          BodyViewer           PinListPanel         │
│       │                   │                     │               │
│       └───────────────────┼─────────────────────┘               │
│                           │                                     │
│                    Zustand Store                                │
│                    (session state)                              │
│                           │                                     │
│                      tRPC Client                                │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                         Server                                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌─────────────┐    ┌─────────────┐                         │
│   │ ai-router   │    │session-router│                         │
│   └──────┬──────┘    └──────┬──────┘                         │
│          │                  │                                 │
│          ▼                  ▼                                 │
│   ┌─────────────────────────────────────────┐                │
│   │              Services                    │                │
│   │  SessionService | PainPointService       │                │
│   │  ShareService                            │                │
│   └──────────────────┬──────────────────────┘                │
│                      │                                        │
│                      ▼                                        │
│   ┌─────────────────────────────────────────┐                │
│   │           Drizzle ORM                    │                │
│   │   sessions | painPoints | sessionHistory │                │
│   └──────────────────┬──────────────────────┘                │
│                      │                                        │
└──────────────────────┼────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

---

## Data Flow

### Manual Pain Point Creation

```
User clicks on 3D model
        │
        ▼
AddPinDialog opens → User fills form
        │
        ▼
session.addPainPoint mutation
        │
        ├──→ Insert into `painPoints` table
        │
        └──→ Create history slot: "[ACTION] Added pain point: ..."
        │
        ▼
Zustand store updated → UI re-renders
```

### AI-Assisted Pain Mapping

```
User types/speaks message
        │
        ▼
ai.processMessage mutation
        │
        ├──→ Fetch session history
        │
        ├──→ Build prompt with:
        │      • Available body zones (from 3D model)
        │      • Full session history
        │      • New user message
        │
        ├──→ LLM returns structured update:
        │      • Pain points to set
        │      • Notes summary
        │
        ├──→ Delete existing pain points
        ├──→ Bulk insert new pain points
        │
        └──→ Create history slot with AI notes
        │
        ▼
Zustand store updated → UI re-renders
```

---

## Database Schema

### `sessions`

| Column    | Type      | Description   |
| --------- | --------- | ------------- |
| id        | UUID      | Primary key   |
| title     | TEXT      | Session name  |
| createdAt | TIMESTAMP | Creation time |
| updatedAt | TIMESTAMP | Last update   |

### `pain_points`

| Column           | Type      | Description     |
| ---------------- | --------- | --------------- |
| id               | UUID      | Primary key     |
| sessionId        | UUID      | FK → sessions   |
| posX, posY, posZ | REAL      | 3D coordinates  |
| label            | TEXT      | Pain name       |
| type             | ENUM      | Pain category   |
| notes            | TEXT      | Additional info |
| rating           | INTEGER   | Intensity 0-10  |
| createdAt        | TIMESTAMP | Creation time   |
| updatedAt        | TIMESTAMP | Last update     |

### `session_history`

| Column      | Type      | Description             |
| ----------- | --------- | ----------------------- |
| id          | UUID      | Primary key             |
| sessionId   | UUID      | FK → sessions           |
| painPoints  | JSONB     | Snapshot of pain points |
| notes       | TEXT      | AI-generated notes      |
| userMessage | TEXT      | User input or action    |
| index       | INTEGER   | Order in history        |
| createdAt   | TIMESTAMP | Creation time           |

### `shares`

| Column    | Type      | Description        |
| --------- | --------- | ------------------ |
| id        | UUID      | Primary key        |
| sessionId | UUID      | FK → sessions      |
| token     | TEXT      | Unique share token |
| createdAt | TIMESTAMP | Creation time      |

---

## API Endpoints

### Session Router (`/api/trpc/session.*`)

| Procedure         | Type     | Description                    |
| ----------------- | -------- | ------------------------------ |
| `create`          | Mutation | Create new session             |
| `getById`         | Query    | Fetch session with pain points |
| `addPainPoint`    | Mutation | Add pain point + history       |
| `updatePainPoint` | Mutation | Update pain point + history    |
| `deletePainPoint` | Mutation | Delete pain point + history    |
| `createShare`     | Mutation | Generate share token           |
| `getByShareToken` | Query    | Fetch session by share token   |
| `getHistory`      | Query    | Fetch session history          |

### AI Router (`/api/trpc/ai.*`)

| Procedure        | Type     | Description                         |
| ---------------- | -------- | ----------------------------------- |
| `processMessage` | Mutation | Send message to LLM, update session |

---

## LLM Integration

### Prompt Structure

```
Available body zones (use these mesh names):
- head: Head
- neck: Neck
- shoulder-left: Left Shoulder
...

Session history:
Slot #0 (2024-01-15T10:00:00Z):
  User: [ACTION] Added pain point: Lower back (dull, intensity: 7/10)
  Notes: N/A
  Pain points:
    - Lower back (dull, intensity: 7/10)

Slot #1 (2024-01-15T10:01:00Z):
  User: It also hurts when I bend forward
  Notes: Patient reports increased pain with forward flexion...
  Pain points:
    - Lower back (dull, intensity: 7/10)

New user message: The pain started 3 days ago

Update the session based on all the context above.
```

### LLM Response Schema

```typescript
{
  painPoints?: [{
    meshName: string;    // Must match predefined zone
    label: string;
    type: PainType;
    rating: number;
    notes?: string;
  }];
  notes?: string;        // Summary for the session
}
```

---

## History System

History tracks **every interaction** for LLM context:

| Source        | userMessage format    | Example                                               |
| ------------- | --------------------- | ----------------------------------------------------- |
| User chat     | Raw message           | "My shoulder hurts"                                   |
| Manual add    | `[ACTION] Added...`   | "[ACTION] Added pain point: Shoulder (sharp, 8/10)"   |
| Manual update | `[ACTION] Updated...` | "[ACTION] Updated pain point: Shoulder (sharp, 6/10)" |
| Manual delete | `[ACTION] Deleted...` | "[ACTION] Deleted pain point: Shoulder"               |

This allows the LLM to understand both natural language inputs and structured user actions.

---

## Key Files

```
src/
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── session-router.ts   # CRUD for sessions/points
│   │   │   └── ai-router.ts        # LLM processing
│   │   └── trpc.ts                 # tRPC setup
│   ├── services/
│   │   ├── session-service.ts      # Session + history logic
│   │   ├── pain-point-service.ts   # Pain point CRUD
│   │   └── share-service.ts        # Share token logic
│   └── db/
│       └── schema/                 # Drizzle schema definitions
├── components/
│   └── session/
│       ├── session-view.tsx        # Main session page
│       ├── body-viewer.tsx         # 3D canvas wrapper
│       ├── human-model.tsx         # GLB model loader
│       ├── pain-pin.tsx            # 3D pin component
│       ├── add-pin-dialog.tsx      # Add pain point form
│       ├── edit-pin-dialog.tsx     # Edit pain point form
│       └── message-input.tsx       # Chat input with voice
├── lib/
│   └── llm/
│       └── session-prompt.ts       # Prompt builder
├── providers/
│   └── store-provider.tsx          # Zustand store
└── types/
    ├── TPainPoint.ts
    ├── TSessionHistory.ts
    └── TAISessionUpdate.ts
```

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, LLM API keys, etc.

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```
