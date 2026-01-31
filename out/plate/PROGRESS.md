### ✅ **Phase 1 : Infrastructure Backend du Blog Custom & RBAC (Role-Based Access Control) — [date inconnue]**

-   **Base de Données (Drizzle ORM) :**
    -   **Schéma des Posts (`blog-schema.ts`) :** Création de la table `post` pour remplacer Payload CMS.
        -   Utilisation de `jsonb` pour le champ `content` afin de stocker l'arbre de nœuds structuré de l'éditeur Plate.js.
        -   Ajout de `slug` (unique, indexé) et `publishedAt` (timestamp nullable) pour gérer la visibilité (Brouillon vs Publié).
        -   Mise en place de la relation `authorId` vers la table `user`.
    -   **Schéma Utilisateur (`auth-schema.ts`) :** Extension de la table `user` avec une colonne `role` (type `text`, défaut `'user'`). Choix d'un type simple plutôt qu'un Enum Postgres pour simplifier les migrations initiales et la compatibilité.
    -   **Export Centralisé :** Mise à jour de `src/server/db/schema/index.ts` pour exposer le nouveau schéma.

-   **Authentification & Sécurité (Better-Auth & tRPC) :**
    -   **Configuration Auth (`auth.ts`) :** Ajout du plugin admin() dans Better-Auth pour gérer les rôles utilisateur.
    -   **Middleware Admin (`trpc.ts`) :** Implémentation du middleware `isAdmin` qui vérifie strictement `ctx.session.user.role === 'admin'`.
    -   **Procédure Protégée :** Création et export de `adminProcedure` pour sécuriser les routes d'administration.

-   **API & Logique Métier (tRPC Router) :**
    -   **Création du `post-router.ts` :** Implémentation complète du CRUD pour les articles de blog.
        -   **Lecture Publique (`getAll`, `getBySlug`) :** Application d'un filtre strict `where: isNotNull(post.publishedAt)` pour ne renvoyer que les articles publiés.
        -   **Lecture Admin (`adminList`, `adminGetById`) :** Accès complet à tous les posts (brouillons et publiés) pour la gestion.
        -   **Écriture (`create`, `update`, `delete`) :** Routes sécurisées via `adminProcedure`.
        -   **Logique Métier :** Vérification d'unicité du slug lors de la création (`CONFLICT` si existant). Gestion intelligente du champ `publishedAt` lors de l'update (set à `Date()` si publié, `null` si dépublié).
    -   **Enregistrement (`root.ts`) :** Ajout du `postRouter` au `appRouter` principal sous l'espace de nom `post`.


### ✅ **Phase 2 : Frontend Admin & Intégration de l'Éditeur Plate.js — [date inconnue]**

-   **Éditeur de Texte Riche (Plate.js) :**
    -   **Composant Core (`src/components/editor/plate-editor.tsx`) :** Implémentation du composant réutilisable encapsulant la logique de Plate.js.
        -   Intégration des plugins de base : `Bold`, `Italic`, `Underline`, `H1-H3`, `Blockquote`.
        -   Mapping des plugins vers les composants UI Shadcn (générés via scaffolding).
        -   Mise en place de la `FixedToolbar` avec boutons de formatage et bascule de type de bloc.
        -   Exposition des props `initialValue`, `onChange` (pour `react-hook-form` futur) et `readOnly` (pour le rendu frontend).
    -   **Playground de Test (`src/app/(frontend)/admin/test-editor/page.tsx`) :** Création d'une page isolée pour valider le fonctionnement de l'éditeur et visualiser la structure JSON de sortie en temps réel avant l'intégration avec la base de données.

-   **Architecture UI Admin :**
    -   **Layout Admin (`src/app/(frontend)/admin/layout.tsx`) :** Mise en place de la structure globale ("Shell") pour les routes `/admin`.
        -   Création d'une Sidebar latérale fixe avec navigation (Posts, Test Editor, Retour App).
        -   Stylisation via Tailwind CSS (Layout responsive basique).

-   **Gestion des Articles (Listing) :**
    -   **Page de Liste (`src/app/(frontend)/admin/posts/page.tsx`) :** Tableau de bord principal affichant tous les articles.
        -   **Data Fetching :** Connexion au routeur tRPC via `api.post.adminList.useQuery()`.
        -   **Tableau UI :** Construction d'un tableau en HTML/Tailwind pur (sans dépendance `Table` Shadcn pour l'instant) pour afficher Titre, Slug, Statut et Date.
        -   **Indicateurs Visuels :** Badges conditionnels pour les statuts "Draft" (Jaune) et "Published" (Vert).
        -   **Actions :**
            -   Bouton "Delete" connecté à la mutation `api.post.delete` (avec confirmation native).
            -   Lien "Edit" vers la future page d'édition.
            -   Lien "View Live" (externe) visible uniquement si l'article est publié.