### ✅ **Phase 1 : Scan automatique et stockage des Predefined Pain Points**

-   **Système de Détection (Scanner GLTF) :**
    -   **Détection dynamique :** Création d'un scanner capable de parcourir la scène GLTF pour identifier les meshes servant de marqueurs (mains, pieds) via des patterns RegEx (`/hand|foot/i`), tout en excluant le mesh principal (`Ch36`).
    -   **Calcul spatial :** Implémentation du calcul du centre géométrique (bounding box) de chaque mesh cible, converti en coordonnées monde (`localToWorld`) pour garantir une précision absolue des futurs "pins".
    -   **Enrichissement automatique :** Génération de labels lisibles ("Right Hand") et catégorisation anatomique ("upper-extremity", "lower-extremity") pour faciliter le mapping spatial de l'IA.
    -   **[`gltf-scanner.ts`] :** Centralise la logique de découverte, de filtrage et de transformation des données brutes 3D.

-   **Gestion d'État (Zustand) :**
    -   **Persistance de session :** Extension du `sessionStore` pour stocker les points découverts, évitant ainsi des calculs redondants à chaque rendu du modèle.
    -   **Méthodes de lookup :** Ajout de l'action `getPredefinedPainPoint` pour permettre une résolution rapide des positions 3D à partir des noms de zones fournis par l'IA.
    -   **[`session-store.ts`] :** Intégration de `predefinedPainPoints`, du flag de chargement et des actions associées.

-   **Intégration 3D & Typage :**
    -   **Cycle de vie :** Déclenchement du scan au montage du composant `HumanModel` via un `useEffect` optimisé par destructuring pour éviter les re-scans inutiles.
    -   **Standardisation des types :** Intégration de l'interface `PredefinedPainPoint` directement dans le fichier de types global pour une meilleure cohérence du projet.
    -   **[`human-model.tsx`, `TPainPoint.ts`] :** Orchestration du scan au chargement du GLTF et définition structurelle des points prédéfinis.

### ✅ **Phase 2 : Intégration de l'IA et Structured Outputs**

-   **Moteur LLM & Prompting :**
    -   **Invocation OpenAI :** Implémentation d'un utilitaire générique utilisant le SDK OpenAI (via OpenRouter) pour générer des réponses structurées via un JSON Schema manuel, assurant une validation stricte des sorties.
    -   **Construction du contexte :** Création d'un builder de prompt agrégeant l'historique de session, les zones 3D disponibles et le message utilisateur pour un mapping précis.
    -   **[`llm.ts`, `ai-prompt-builder.ts`, `TAISessionUpdate.ts`]** : Gèrent la logique d'appel, le formatage des données et les schémas de validation Zod.

-   **Infrastructure API (TRPC) :**
    -   **Router AI :** Orchestration complète du flux : appel LLM, résolution des noms de zones en coordonnées 3D, suppression/recréation des points (override) et archivage dans l'historique.
    -   **[`ai-router.ts`, `root.ts`]** : Centralisent la mutation `processMessage` et l'intégration au router principal.

-   **Interface & Expérience Utilisateur :**
    -   **Feedback visuel :** Ajout d'un état de chargement "AI is thinking" avec un effet de shimmer synchronisé sur la mutation.
    -   **Synchronisation des notes :** Mise à jour automatique du panneau latéral de notes avec le contenu généré par l'IA.
    -   **[`session-view.tsx`, `message-input.tsx`, `ai-thinking-shimmer.tsx`]** : Intègrent la mutation AI et les retours visuels associés.

-   **Configuration & Nettoyage :**
    -   **Environnement :** Ajout et validation de la variable `OPENROUTER_API_KEY`.
    -   **Optimisation des logs :** Réduction drastique des logs serveur pour ne conserver que le prompt d'entrée et le JSON de sortie pour le debugging.
    -   **[`env.ts`, `.env.example`, `package.json`]** : Mise à jour des dépendances (`openai`, `zod-to-json-schema`) et des variables système.

### ✅ **Phase 3 : Refactoring du Moteur LLM et Généricité**

-   **Moteur LLM & Généricité :**
    -   **Abstraction de `llmInvoke` :** Transformation de la fonction en utilitaire générique (`<T>`) acceptant un `ZodType<T>`. Cette approche permet de réutiliser l'invocation LLM pour n'importe quel schéma sans duplication de code.
    -   **Conversion Native JSON Schema :** Remplacement du JSON Schema écrit à la main par une conversion automatique via `z.toJSONSchema()` (Zod 4). Le schéma Zod devient l'unique source de vérité pour la structure des données.
    -   **Validation et Typage :** Intégration de `schema.parse()` pour garantir que la réponse de l'IA est validée et typée correctement avant son retour.
    -   **[`llm.ts`] :** Refonte complète pour supporter l'injection du message système et la validation dynamique.

-   **Prompting & Organisation :**
    -   **Restructuration des Fichiers :** Renommage de `ai-prompt-builder.ts` en `session-prompt.ts` pour une meilleure sémantique.
    -   **Extraction du Message Système :** Déplacement du `SESSION_SYSTEM_MESSAGE` dans le fichier de prompt pour centraliser les instructions métier de l'IA.
    -   **Optimisation du Builder :** Simplification de `buildSessionPrompt` par la suppression du paramètre `session` non utilisé, optimisant ainsi la construction du contexte envoyé à l'IA.
    -   **[`session-prompt.ts`] :** Centralise désormais la configuration du rôle de l'IA et la logique de formatage du prompt.

-   **Intégration API :**
    -   **Mise à jour du Router AI :** Adaptation de la mutation `processMessage` pour utiliser la nouvelle signature de `llmInvoke`. L'appel est désormais plus propre et bénéficie d'une inférence de type automatique pour la réponse de l'IA.
    -   **[`ai-router.ts`] :** Mise à jour des imports et de la logique d'appel pour refléter les changements de structure des prompts.