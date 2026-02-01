### ✅ **Phase 1 : MessageInput avec enregistrement vocal**

-   **Implémentation du MessageInput :**
    -   Créé l'input utilisateur avec auto-resize et enregistrement vocal
    -   Ajouté le visualiseur audio pendant l'enregistrement
    -   Intégré au centre bas du body viewer 3D dans `session-view.tsx`
    -   Placeholder configuré : "Describe what's wrong..."

-   **Simplifications :**
    -   Retrait complet de la fonctionnalité d'attachements de fichiers

### ✅ **Phase 2 : Restructuration du layout de session en 3 colonnes**

-   **Architecture du layout :**
    -   Restructuration complète de `session-view.tsx` pour implémenter un layout à 3 colonnes fixes
    -   Structure finale : Panel pins (gauche, 320px) | Viewer 3D (centre, flex) | Panel notes (droite, 320px)
    -   Utilisation d'un conteneur flex avec `overflow-hidden` pour garantir que les panels restent dans la viewport
    -   Header fixe en haut avec le titre de session, séparé par une bordure

-   **Panel gauche - Liste des points de douleur :**
    -   **Création de `pin-list-panel.tsx` :** Nouveau composant standalone remplaçant le système `PinListSidebar` basé sur `SidebarProvider`
    -   **Composant `PinListPanel` :** Panel simple avec largeur fixe (`w-80` = 320px), bordure à droite, background uniforme
    -   **Structure du panel :**
        -   Header avec compteur de points et bouton de test "Add pin on right hand"
        -   Zone scrollable contenant les cartes de points avec `overflow-y-auto`
        -   Message d'invite si aucun point enregistré
    -   **Cartes de points :** Utilisation du composant `Card` de shadcn avec hover effect (`hover:bg-accent/50`)
    -   **Affichage des données :** Icône `MapPin`, label, type de douleur (traduit), badge coloré selon l'intensité (vert ≤3, jaune 4-6, rouge ≥7), notes tronquées à 2 lignes
    -   **Props :** `sessionId`, `onPinClick` (édition), `onTestAddPin` (optionnel, pour le bouton de test)

-   **Zone centrale - Viewer 3D :**
    -   **Modification de `body-viewer.tsx` :** Correction du wrapper du Canvas pour occupation complète de l'espace
    -   **Fix du sizing :** Changement de `flex-1` vers `absolute inset-0` pour que le Canvas prenne toute la hauteur/largeur du conteneur parent
    -   **Retrait du bouton de test :** Déplacement vers le `PinListPanel` pour centraliser les contrôles
    -   **Remontée du state :** `targetMesh` et `setTargetMesh` convertis en props (gérés par `session-view.tsx`) permettant au bouton du panel gauche de déclencher l'ajout de pin programmatique
    -   **MessageInput :** Conservé en position `absolute bottom` au centre, avec largeur maximale de `max-w-2xl`, au-dessus du viewer (`z-20`)

-   **Panel droit - Zone de notes :**
    -   **Implémentation :** Textarea éditable simple sans styling de bordure
    -   **Dimensions :** Largeur fixe `w-80` (320px), bordure à gauche, prend toute la hauteur avec `flex-1`
    -   **Styling de la textarea :** 
        -   Suppression complète des bordures (`border-0`, `shadow-none`, `rounded-none`)
        -   Pas de ring au focus (`focus-visible:ring-0`, `focus-visible:ring-offset-0`)
        -   Resize désactivé (`resize-none`)
        -   Padding confortable (`p-4`)
    -   **Placeholder :** "Describe what's wrong..." (identique au MessageInput)
    -   **State local :** Géré dans `session-view.tsx` avec `notes` et `setNotes` (pas de persistence pour l'instant)

-   **Gestion du state et interactions :**
    -   **State remontés dans `session-view.tsx` :**
        -   `targetMesh` : Pour déclencher l'ajout de pin sur un mesh spécifique depuis le bouton de test
        -   `notes` : Contenu de la textarea de droite
        -   `input` : Contenu du MessageInput (existant)
        -   `isEditDialogOpen` et `editingPinId` : Gestion de l'édition de pins (existants)
    -   **Fonction `handleTestAddPin` :** Modifie `targetMesh` pour déclencher la logique d'ajout automatique dans `HumanModel`
    -   **Props passées au `BodyViewer` :** Ajout de `targetMesh` et `setTargetMesh` pour connecter le bouton de test à la logique 3D

### ✅ **Phase 3 : Amélioration de l'ergonomie de l'interface**

-   **Simplification du panel gauche :**
    -   **Retrait du titre "Points Registered"** et de la bordure de séparation dans `pin-list-panel.tsx`
    -   Conservation du bouton de test uniquement dans le header

-   **Ajout d'instructions utilisateur :**
    -   **Texte d'instruction discret** ajouté en haut du body viewer dans `session-view.tsx`
    -   Positionnement centré avec `text-muted-foreground/60` pour faible visibilité
    -   Message : "Click on the body to mark where you feel pain. You can rotate the model by dragging."

### ✅ **Phase 4 : Centralisation de l'état de session avec Zustand Store**

-   **Types centralisés :**
    -   **`src/types/TPainPoint.ts`** : `PainPoint`, `NewPainPoint`, `PainPointUpdate`, `PAIN_TYPES` constant
    -   **`src/types/TSession.ts`** : `Session`, `SessionWithPainPoints`

-   **Store Zustand :**
    -   **`src/stores/session-store.ts`** : Store vanilla avec état (`session`, `isLoading`, `selectedPinId`) et actions (`setSession`, `addPainPoint`, `updatePainPoint`, `removePainPoint`, `selectPin`, `clearSelection`, `reset`)

-   **Provider React :**
    -   **`src/providers/store-provider.tsx`** : Context wrapper avec hook `useSessionStore((state) => state)` pour accès au store
    -   **`src/app/layout.tsx`** : Intégration du `StoreProvider` entre TRPCProvider et NextIntlClientProvider

-   **Adaptation des composants :**
    -   **`session-view.tsx`** : Synchronisation tRPC → Store via `useEffect`, gestion de la sélection de pins
    -   **`body-viewer.tsx`** : Lecture des `painPoints` depuis le store (suppression query locale)
    -   **`pin-list-panel.tsx`** : Lecture de `session` depuis le store (suppression query locale)
    -   **`add-pin-dialog.tsx`** : Utilisation de `addPainPoint()` après mutation tRPC
    -   **`edit-pin-dialog.tsx`** : Utilisation de `updatePainPoint()` et `removePainPoint()` après mutations tRPC
    -   **`pain-pin.tsx`** : Migration de l'import vers `@/types/TPainPoint`

-   **Pattern :**
    -   Mutations optimistes : Update store immédiatement → Invalidate cache tRPC
    -   Usage du store : `const { prop1, prop2 } = useSessionStore((state) => state)`
    -   Suppression de l'ancien store (`src/lib/stores/session-store.ts`)

### ✅ **Phase 5 : Système d'historique par snapshots**

-   **Schema de base de données :**
    -   **`src/server/db/schema/session-history.ts`** : Table `session_history` avec snapshots JSON des pain points
    -   **Champs :** `painPoints` (jsonb), `notes` (text), `userMessage` (text), `index` (integer pour ordre chronologique)
    -   **Relations :** Lien vers `sessions` avec cascade delete
    -   **Export :** Ajouté dans `src/server/db/schema/index.ts`

-   **Types TypeScript :**
    -   **`src/types/TSessionHistory.ts`** : Interfaces `SessionHistorySlot` et `NewSessionHistorySlot`

-   **Endpoints tRPC :**
    -   **`createHistorySlot`** : Capture tous les pain points actuels + notes + message utilisateur, calcule l'index automatiquement
    -   **`getHistory`** : Récupère tous les slots d'une session ordonnés par index

-   **Store Zustand :**
    -   **`src/stores/session-store.ts`** : Ajout de `historySlots` dans le state
    -   **Actions :** `setHistory` (chargement initial), `addHistorySlot` (ajout après création)

-   **Intégration UI :**
    -   **`session-view.tsx`** : Query de l'historique au mount, mutation `createHistorySlot` au submit du MessageInput
    -   **Trigger :** Création d'un nouveau slot uniquement quand l'utilisateur envoie un message (pas à chaque modification)
    -   **État `isGenerating`** : Connecté à la mutation pour feedback visuel