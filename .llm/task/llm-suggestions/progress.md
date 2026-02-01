### ✅ **Phase 1 : Système de Suggestions Contextuelles LLM**

-   **Architecture & Base de données :**
    -   **Schema `suggestions`** : Nouvelle table Drizzle avec `title`, `description`, `index`, relations cascade vers `sessions`. Stocke 0-4 questions générées par l'IA pour guider l'utilisateur.
    -   **Types TypeScript** : `TSuggestion.ts` définit `Suggestion`, `NewSuggestion`, et `SuggestionsResponse` (contrat LLM).

-   **Service Layer :**
    -   **`SuggestionService`** : Opération principale `replaceAll()` qui supprime les anciennes suggestions et insère les nouvelles de manière atomique. Méthodes `getBySessionId()` et `deleteAll()` pour récupération et cleanup.

-   **Intelligence LLM :**
    -   **Prompts spécialisés** : `suggestions-prompt.ts` contient le system message focalisé sur la génération de questions contextuelles (timing, triggers, traitements, impact fonctionnel). Règles strictes pour éviter la redondance et respecter le contexte existant.
    -   **Prompt Builder** : `suggestions-prompt-builder.ts` construit le prompt avec pain points actuels, historique complet des échanges, et notes de session.
    -   **Modèle rapide** : Utilisation de `gemini-flash-1.5-8b` pour génération rapide (tâche simple).

-   **API tRPC :**
    -   **`suggestions-router.ts`** : Procédure `generate` (mutation) qui analyse le contexte complet via LLM et stocke 0-4 suggestions. Procédure `getBySessionId` (query) pour récupération.
    -   **Intégration dans `ai-router.ts`** : Après chaque `processMessage`, génération automatique de suggestions en try-catch (non-bloquant). Appel direct des services pour éviter circular dependencies.

-   **State Management :**
    -   **Extension `session-store.ts`** : Ajout de `suggestions: Suggestion[]` et `suggestionsLoading: boolean`. Actions `setSuggestions()`, `setSuggestionsLoading()`, `clearSuggestions()`. Intégration dans `reset()`.

-   **Interface Utilisateur :**
    -   **`suggestion-card.tsx`** : Mini-card avec icône Lightbulb, border jaune à gauche, titre tronqué (2 lignes max). Hover effect subtil.
    -   **`suggestion-dialog.tsx`** : Dialog shadcn/ui affichant titre + description complète + note pédagogique rappelant d'utiliser le MessageInput pour répondre.
    -   **`suggestions-panel.tsx`** : Section complète avec header explicatif, états loading/empty/normal gérés. Separator visuel pour distinction des pain points. Ne s'affiche pas si 0 suggestions ET pas en loading.
    -   **`pin-list-panel.tsx`** : Intégration de `<SuggestionsPanel />` en bas du panel gauche, masquée en mode read-only.
    -   **`session-view.tsx`** : Orchestration complète - fetch suggestions via tRPC, hydratation du store, invalidation query après `processMessage` pour rafraîchissement temps réel. Utilisation correcte de `api.useUtils()` au niveau composant.

-   **Flux Fonctionnel :**
    1. User envoie message → `processMessage` mutation
    2. Loading state activé (`setSuggestionsLoading(true)`)
    3. Backend génère pain points + suggestions (appel LLM indépendant)
    4. `onSettled` invalide query suggestions
    5. Auto-refetch → Nouvelles suggestions dans store
    6. UI update instantané avec 0-4 cards cliquables

-   **État Actuel :**
    -   ✅ Système complet et fonctionnel end-to-end
    -   ✅ Génération contextuelle intelligente (évite redondance)
    -   ✅ UI cohérente avec design system (shadcn/ui)
    -   ✅ Rafraîchissement temps réel sans reload page
    -   ✅ Loading states et empty states gérés proprement
    -   ✅ Non-bloquant : échec suggestions n'impacte pas le flux principal