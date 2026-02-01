# Task Definition: Système de Suggestions Contextuelles LLM

## 📋 L'État Actuel

### Architecture Existante

Notre application est une plateforme de mapping de douleurs sur un modèle 3D du corps humain. Voici les composants pertinents pour cette tâche :

#### 1. Structure UI Actuelle
- **Layout trois colonnes** (`components/session/session-view.tsx`) :
  - **Left panel** : `PinListPanel` - Liste des pain points avec titre, type, rating et notes
  - **Center** : Visualisation 3D du corps avec pins interactifs
  - **Right panel** : Zone de notes générales

#### 2. Système LLM Existant
- **Route API** : `server/api/routers/ai-router.ts`
  - Procédure `processMessage` qui :
    - Prend le message utilisateur
    - Récupère l'historique de session via `SessionService.getHistory()`
    - Construit un prompt structuré avec `buildSessionPrompt()`
    - Appelle le LLM via `llmInvoke()` avec schema Zod strict
    - Update les pain points et crée un history slot
    - Retourne la session mise à jour

- **Prompting** : `lib/llm/session-prompt.ts` et `session-prompt-builder.ts`
  - Utilise du XML-style prompting
  - Construit un contexte exhaustif avec :
    - Zones corporelles disponibles (predefined pain points)
    - Historique complet de la session (slots avec pain points à chaque étape)
    - Message utilisateur actuel
  - Format structuré et verbose pour maximiser la qualité des réponses

- **Logger** : `lib/llm/logger.ts` - Enregistre tous les appels LLM dans `logs/llm-requests.md`

#### 3. État de la Session
- **Store Zustand** : `stores/session-store.ts`
  - Gère : session, pain points, history slots, predefined pain points
  - Fournit des actions pour update/add/remove pain points
  - Permet la sélection de pins

- **Base de données** (`server/db/schema/`) :
  - `sessions` : id, title, timestamps
  - `pain_points` : position 3D, label, type, notes, rating
  - `session_history` : snapshots de pain points + notes + userMessage par index
  - Tous liés avec Drizzle ORM relations

#### 4. UI Components
- Utilise **shadcn/ui** : Dialog, Card, Badge, Button, Input, Textarea, etc.
- Pattern établi : dialogs pour édition (voir `edit-pin-dialog.tsx`, `add-pin-dialog.tsx`)
- Cards pour listes (voir `pin-list-panel.tsx`)

### Ce qui Manque
- **Aucun système de suggestions** pour guider l'utilisateur dans sa description
- Pas de mécanisme pour proposer des questions de clarification
- L'utilisateur doit savoir quoi dire sans guidance

---

## 🎯 Le WHY - Pourquoi Cette Fonctionnalité

### Problème Actuel
Quand un patient utilise l'application, il doit décrire ses douleurs de manière autonome. Sans expérience médicale, il peut :
- **Omettre des détails importants** (début des symptômes, facteurs aggravants, etc.)
- **Ne pas savoir quoi dire** après avoir placé quelques pins
- **Donner des descriptions incomplètes** qui limitent la qualité du diagnostic

### Objectif
Créer un **système de suggestions intelligentes** qui :
1. **Guide l'utilisateur** en posant des questions contextuelles pertinentes
2. **S'adapte dynamiquement** à l'état actuel de la session (pain points placés, historique, descriptions déjà données)
3. **Enrichit les données** en incitant à fournir des informations médicalement utiles
4. **Reste non-intrusif** : suggestions optionnelles, pas obligatoires

### Valeur Ajoutée
- **Pour l'utilisateur** : aide à mieux s'exprimer, guidance douce, sensation d'être accompagné
- **Pour le professionnel** : données plus complètes et structurées pour le diagnostic
- **Pour le système** : historique plus riche qui améliore les futures interactions LLM

---

## 🔮 La Vision - Comment Ça Doit Fonctionner

### Expérience Utilisateur

#### 1. Génération des Suggestions
**Trigger** : Après chaque appel à `processMessage` (route AI existante)
- Le système fait un **second appel LLM indépendant**
- Cet appel analyse le contexte complet de la session
- Génère **0 à 4 suggestions** sous forme de questions

**Exemple de contexte** :
```
Session: 2 pain points (lower back sharp 7/10, right knee dull 4/10)
History: "I fell yesterday while running"
Latest notes: "Pain worse when sitting"
```

**Exemples de suggestions générées** :
- "Have you noticed any numbness or tingling in your legs?"
- "Does the knee pain increase with stairs or specific movements?"
- "What time of day is the back pain worst?"
- "Have you taken any medication or treatment so far?"

#### 2. Affichage dans le Left Panel

**Nouveau layout de `PinListPanel`** :
```
┌─────────────────────────┐
│  Pain Points (2)        │  <- Section existante
├─────────────────────────┤
│  [Card: Back pain]      │
│  [Card: Knee pain]      │
├─────────────────────────┤
│  💡 Suggestions         │  <- NOUVELLE SECTION
│  Help us understand...  │
├─────────────────────────┤
│  [Mini card: Question1] │
│  [Mini card: Question2] │
│  [Mini card: Question3] │
└─────────────────────────┘
```

**Description pédagogique** (à afficher en haut de la section suggestions) :
> "These are optional questions that can help provide a more complete picture of your condition. You can answer them in the message input below."

#### 3. Interaction avec une Suggestion
**Au clic sur une mini-card** :
- Ouvre un **Dialog shadcn/ui**
- Affiche le titre de la question en header
- Affiche la description complète dans le body
- Bouton "Close" pour fermer
- **Pas de champ de réponse dans le dialog** : l'utilisateur répond via le MessageInput existant

**Design des Mini-Cards** :
- Titre court (max 1 ligne, ellipsis)
- Icône optionnelle (💡, ❓, 📋)
- Hover effect subtil
- Click → Dialog

### Architecture Technique

#### 1. Base de Données
**Nouvelle table `suggestions`** :
```typescript
{
  id: uuid (PK)
  sessionId: uuid (FK -> sessions.id, cascade delete)
  title: text (court, question résumée)
  description: text (question complète, contexte)
  index: integer (ordre d'affichage)
  createdAt: timestamp
}
```

**Logique de stockage** :
- À chaque appel LLM de suggestions, **on delete toutes les suggestions existantes** de cette session
- On insert les nouvelles (0 à 4)
- Ça garantit que les suggestions restent pertinentes au contexte actuel

#### 2. Route API tRPC
**Nouvelle procédure dans un router** (créer `suggestions-router.ts` ou ajouter dans `ai-router.ts`) :

```typescript
generateSuggestions: publicProcedure
  .input(z.object({
    sessionId: z.string().uuid(),
    predefinedPoints: z.array(predefinedPainPointSchema),
  }))
  .mutation(async ({ input }) => {
    // 1. Récupérer le contexte complet :
    //    - session avec pain points actuels
    //    - history slots
    //    - predefined points
    
    // 2. Construire un prompt simple qui dump tout
    
    // 3. Appel llmInvoke avec schema Zod pour suggestions
    
    // 4. Delete suggestions existantes de cette session
    
    // 5. Insert nouvelles suggestions (si array non vide)
    
    // 6. Return les nouvelles suggestions
  })
```

**Intégration dans `processMessage`** :
Après le `return { session, historySlot }` actuel, ajouter un appel asynchrone (fire-and-forget ou awaited) :
```typescript
// Générer suggestions après update de session
await generateSuggestionsMutation.mutateAsync({ sessionId, predefinedPoints });
```

#### 3. Prompting LLM pour Suggestions

**Philosophie** : Simple et direct, pas de complexité inutile

**System Message** (draft) :
```
You are a medical assistant helping gather complete information about a patient's pain.

Based on the current session state (pain points, history, notes), generate 2-4 relevant questions that would help understand the patient's condition better.

Rules:
- Questions should be specific and contextual
- Avoid asking what's already known
- Focus on: timing, triggers, severity changes, treatments tried, functional impact
- Return 0 questions if the context is already very complete
- Each question needs a short title (max 8 words) and a detailed description

Return valid JSON matching the schema.
```

**User Prompt** (template simple) :
```xml
<session_context>
  <pain_points>
    <!-- Liste des pain points actuels -->
  </pain_points>
  
  <history>
    <!-- History slots avec messages utilisateur et notes -->
  </history>
  
  <available_zones>
    <!-- Pour référence si besoin -->
  </available_zones>
</session_context>

Generate 0-4 contextual questions to help complete the medical picture.
```

**Schema Zod** :
```typescript
const suggestionSchema = z.object({
  title: z.string().max(100),
  description: z.string().max(500),
});

const suggestionsResponseSchema = z.object({
  suggestions: z.array(suggestionSchema).max(4),
});
```

#### 4. Service Layer
**Nouveau `SuggestionService`** (`server/services/suggestion-service.ts`) :
```typescript
export const SuggestionService = {
  async replaceAll(sessionId: string, suggestions: Array<{title, description}>) {
    // DELETE existantes
    // INSERT nouvelles avec index
  },
  
  async getBySessionId(sessionId: string) {
    // SELECT avec order by index
  },
};
```

#### 5. Store Zustand
**Extension de `session-store.ts`** :
```typescript
export interface SessionStoreState {
  // ... existant
  suggestions: Suggestion[];
  
  setSuggestions: (suggestions: Suggestion[]) => void;
  clearSuggestions: () => void;
}
```

#### 6. UI Components

**Nouveaux composants** :
- `components/session/suggestions-panel.tsx` : Section avec description + liste de mini-cards
- `components/session/suggestion-card.tsx` : Mini-card cliquable avec titre
- `components/session/suggestion-dialog.tsx` : Dialog pour afficher la question complète

**Modification de `PinListPanel`** :
- Ajouter la `<SuggestionsPanel />` en bas
- Ajouter une `<Separator />` entre les deux sections

**Intégration dans `session-view.tsx`** :
- Fetch suggestions via tRPC query : `api.session.getSuggestions.useQuery({ sessionId })`
- Passer au store via `setSuggestions()`
- Le `PinListPanel` lit depuis le store

### Flux Technique Complet

```
1. User envoie message
   ↓
2. processMessage mutation (existant)
   ↓ 
3. Update pain points + create history slot
   ↓
4. onSuccess: trigger generateSuggestions mutation
   ↓
5. LLM analyse contexte complet
   ↓
6. Retourne 0-4 suggestions
   ↓
7. SuggestionService.replaceAll() dans DB
   ↓
8. Update store avec nouvelles suggestions
   ↓
9. UI re-render avec nouvelles cards
```

### Principes de Design

1. **Non-intrusif** : Les suggestions ne bloquent jamais, sont clairement optionnelles
2. **Contextuel** : Générées à chaque update, toujours pertinentes à l'état actuel
3. **Simple** : Pas de complexité UI, juste des cards + dialog
4. **Performant** : Génération async, n'impacte pas le flux principal
5. **Cohérent** : Utilise le même style UI que le reste (shadcn, même palette)

### Cas Limites à Gérer

- **Pas de suggestions pertinentes** : OK de retourner array vide, afficher message "No suggestions at the moment"
- **Erreur LLM** : Ne pas bloquer, juste logger et laisser suggestions vides
- **Première interaction** : Peut générer des questions génériques ("When did the pain start?")
- **Session très complète** : LLM doit retourner 0 suggestions si tout est déjà bien documenté

---

## 📦 Scope Technique

### Fichiers à Créer
1. `server/db/schema/suggestions.ts` - Schema Drizzle
2. `server/services/suggestion-service.ts` - CRUD suggestions
3. `server/api/routers/suggestions-router.ts` - Routes tRPC (ou étendre ai-router)
4. `lib/llm/suggestions-prompt.ts` - System + template prompts
5. `lib/llm/suggestions-prompt-builder.ts` - Build contexte
6. `types/TSuggestion.ts` - Types TypeScript
7. `components/session/suggestions-panel.tsx` - Section UI
8. `components/session/suggestion-card.tsx` - Mini-card
9. `components/session/suggestion-dialog.tsx` - Dialog détail

### Fichiers à Modifier
1. `server/db/schema/index.ts` - Export nouveau schema
2. `stores/session-store.ts` - Ajouter state suggestions
3. `components/session/pin-list-panel.tsx` - Intégrer SuggestionsPanel
4. `components/session/session-view.tsx` - Fetch + hydrate suggestions
5. `server/api/routers/ai-router.ts` - Trigger generateSuggestions après processMessage
6. `server/api/root.ts` - Ajouter suggestions router si créé séparément

### Migration DB
- Nouvelle table `suggestions` avec foreign key vers `sessions`
- Index sur `sessionId` pour performance

### Dépendances
- **Aucune nouvelle dépendance** : tout existe déjà (shadcn/ui, tRPC, Drizzle, Zod, OpenAI client)

---

## ✅ Critères de Succès

1. ✅ Après chaque message utilisateur, 0-4 suggestions apparaissent dans le left panel
2. ✅ Les suggestions sont contextuellement pertinentes (basées sur l'historique complet)
3. ✅ Au clic sur une suggestion, un dialog s'ouvre avec la question complète
4. ✅ Une description pédagogique explique que les questions sont optionnelles
5. ✅ L'UI est cohérente avec le reste (shadcn, même style que pain points cards)
6. ✅ Aucun bug introduit dans le flux existant (pain points, history, LLM principal)
7. ✅ Les suggestions se mettent à jour dynamiquement à chaque nouvelle interaction
8. ✅ La performance reste fluide (génération async, pas de blocage UI)

---

## 🎨 Considérations UX

- **Distinction visuelle** : Les suggestion cards doivent être visuellement différentes des pain point cards (taille, couleur, icône)
- **Scroll** : Si beaucoup de pain points + suggestions, le panel doit scroller proprement
- **Loading state** : Pendant génération suggestions, afficher un skeleton ou spinner subtil
- **Vide** : Si 0 suggestions, soit masquer la section, soit afficher "All good! No additional questions right now."
- **Mobile** : Pas de mobile dans le scope actuel, mais garder en tête la responsivité du left panel

