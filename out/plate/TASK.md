# Task: Replace Payload CMS with Custom Plate.js Blog System

## 1. Executive Summary
**Objective:** Remove Payload CMS entirely from the project and replace it with a custom, lightweight blogging system integrated directly into the existing Next.js/tRPC/Drizzle architecture.
**Core Feature:** Implementation of a rich-text editor using **Plate.js** to manage blog posts.
**Motivation:** Payload CMS is currently "overkill" for the project's needs and introduces unnecessary configuration complexity. A custom solution will reduce dependencies, unify the database schema (single Drizzle source of truth), and provide a more streamlined developer experience.

---

## 2. Current State (The "Before")
Currently, the application uses a dual-database/dual-logic approach:
*   **App Logic:** Managed by `src/server` using tRPC and Drizzle.
*   **Content Logic:** Managed by Payload CMS (`src/payload.config.ts`, `src/payload_collections`).
*   **Database:** Payload manages its own tables within the shared Postgres instance.
*   **Routing:** Payload mounts its own admin UI at `/admin` (or similar) via Next.js route groups.

**Problems:**
*   High maintenance overhead for simple blog requirements.
*   Context switching between Drizzle schemas and Payload collections.
*   Heavy bundle size impact from Payload.

---

## 3. The Vision (The "After")
We will build a **native Admin Dashboard** within the application that reuses our existing UI components (Shadcn) and backend patterns (tRPC).

### Key Features
1.  **Unified Auth:** Reuse `Better-Auth` but introduce an **Admin Role** system. Only admins can access the new dashboard.
2.  **Custom Admin UI:** A clean interface at `/admin/posts` to list, create, and edit posts.
3.  **The Editor:** A rich-text experience powered by **Plate.js** supporting:
    *   Basic formatting (Bold, Italic, Underline).
    *   Headings (H1-H3).
    *   Blockquotes.
    *   **Image Uploads** (Drag & drop or button click).
4.  **Public Blog:** A high-performance, server-rendered blog at `/blog` that renders the Plate JSON content.

---

## 4. Technical Requirements & Architecture

### A. Database Schema (Drizzle)
We need to extend the existing Drizzle schema to support posts and user roles.

**File:** `src/server/db/schema/blog-schema.ts` (New File)
*   **Table:** `posts`
    *   `id`: uuid (primary key)
    *   `slug`: text (unique, indexed)
    *   `title`: text
    *   `description`: text (for SEO/Previews)
    *   `content`: jsonb (Stores the Plate.js Node tree)
    *   `coverImage`: text (URL)
    *   `publishedAt`: timestamp (nullable - determines visibility)
    *   `authorId`: reference to `users.id`
    *   `createdAt` / `updatedAt`

**File:** `src/server/db/schema/auth-schema.ts` (Modification)
*   Add `role` column to `user` table (enum: 'user', 'admin'). Default to 'user'.

### B. Authentication & Protection
*   **Middleware:** Ensure `/admin/*` routes are protected and check for `session.user.role === 'admin'`.
*   **tRPC Middleware:** Create an `adminProcedure` in `src/server/api/trpc.ts` that enforces the admin role.

### C. The Editor (Plate.js Integration)
We will implement Plate.js following the "Headless" approach with Shadcn UI components.

**Components:**
*   `src/components/plate-editor.tsx`: The main wrapper.
*   **Plugins:**
    *   `@plate/basic-nodes-kit` (Bold, Italic, H1-H3, Blockquote).
    *   `@plate/media` (Image).
*   **Image Handling:**
    *   We need a custom upload handler passed to the Plate Image plugin.
    *   When an image is dropped/selected, it should upload to our storage provider (via a new API endpoint) and return the URL to be inserted into the editor content.

### D. Backend Services (tRPC)
**Router:** `src/server/api/routers/post-router.ts`
1.  `getAll`: (Public) Returns published posts, sorted by date.
2.  `getSlug`: (Public) Returns a single published post by slug.
3.  `adminList`: (Admin) Returns all posts (draft & published) with pagination.
4.  `adminGet`: (Admin) Returns full post data for editing.
5.  `create`: (Admin) Creates a draft.
6.  `update`: (Admin) Updates content/metadata.
7.  `delete`: (Admin) Removes a post.
8.  `generateUploadUrl`: (Admin) Returns a presigned URL (S3/R2) or handles upload for post images.

---

## 5. Implementation Steps

### Phase 1: Demolition 🧨
1.  **Uninstall Payload:** Remove `payload`, `payload-admin-bar`, and related dependencies.
2.  **Delete Files:**
    *   `src/payload.config.ts`
    *   `src/payload_collections/`
    *   `src/app/(payload)/`
    *   `src/payload-types.ts`
3.  **Clean Config:** Remove Payload plugins from `next.config.ts`.

### Phase 2: Foundation 🏗️
1.  **Schema:** Create `blog-schema.ts` and update `auth-schema.ts`. Run `db:generate` and `db:migrate`.
2.  **Seed:** Manually update your local user to have `role: 'admin'` in the database.
3.  **TRPC:** Create `adminProcedure` middleware in `src/server/api/trpc.ts`.

### Phase 3: The Editor (Plate.js) 📝
1.  **Install:** `npm install @plate/editor @plate/basic-nodes-kit @plate/ui` (and required Shadcn deps).
2.  **Scaffold:** Run `npx shadcn@latest add @plate/editor` (and other components as per docs).
3.  **Component:** Build `src/components/editor/plate-editor.tsx`.
    *   It must accept `initialValue` (for editing) and `onChange` (to lift state up to the form).
    *   Configure the Toolbar (Bold, Italic, Headings, Image).

### Phase 4: Admin Dashboard 🎛️
1.  **Layout:** Create `src/app/(frontend)/admin/layout.tsx` (Sidebar, Admin Auth Check).
2.  **List View:** `src/app/(frontend)/admin/posts/page.tsx`
    *   Table of posts.
    *   "Create New" button.
3.  **Editor View:** `src/app/(frontend)/admin/posts/[id]/page.tsx`
    *   Uses `react-hook-form` + `zod`.
    *   Fields: Title, Slug (auto-generate from title), Description, Published Date.
    *   Embeds the `PlateEditor` component for the content field.
    *   Save button triggers `post.update` or `post.create`.

### Phase 5: Public Views 🌍
1.  **Blog Index:** `src/app/(frontend)/blog/page.tsx`
    *   Fetches `post.getAll`.
    *   Renders list of cards.
2.  **Blog Post:** `src/app/(frontend)/blog/[slug]/page.tsx`
    *   Fetches `post.getSlug`.
    *   **Rendering:** Use `<Plate readOnly initialValue={post.content} />` to render the content accurately without the toolbar.

---

## 6. Key Constraints & Guidelines
*   **Styling:** Use `Tailwind V4` and `Shadcn/UI` for the Admin panel to match the rest of the app.
*   **Type Safety:** The `content` field in DB is `jsonb`. In TypeScript, define a Zod schema for the Plate Value to ensure type safety when parsing DB results.
*   **Images:** For this task, if no S3/R2 is configured, implement a basic local file upload route or a placeholder "Insert Image URL" prompt to unblock the UI work.
*   **Routing:** Ensure `src/app/(frontend)/admin` is excluded from `robots.txt` (if applicable) or protected via middleware.

## 7. Reference Documentation
*   **Plate Installation:** https://platejs.org/docs/installation/next
*   **Plate Plugins:** https://platejs.org/docs/plugin
*   **Existing Router:** `src/server/api/routers/stripe-router.ts` (Copy this pattern for `post-router.ts`)
