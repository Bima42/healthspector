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