# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Authentication & Data Persistence (app-specific)

This project uses Firebase (Firestore) for server-side persistence and localStorage for fast local drafts and caching. The editor keeps a single in-memory resume object (`resume`) in `src/pages/Resume.jsx` and persists it using a few conventions described below.

### Authentication

- Recommended approach: use Firebase Authentication to identify users and secure their documents. There is an auth helper file at `src/firebase/auth.js` (if present) to centralize initialization.
- Persist the user's UID and apply Firestore security rules so each user can only read/write their own resume documents.
- If you add Auth, include `ownerUid` or similar on each saved document or store a mapping from doc id to owner uid.

Notes:
- Firebase environment variables are read from Vite via `import.meta.env.VITE_FIREBASE_*`. The fallback sample values are visible in `src/firebase/firestore.js`.

### Firestore structure

- Collections used by this app:
	- `resume_content` — stores resume content: `formData` and `sections`. Documents include `createdAt` / `updatedAt` server timestamps.
	- `resume_layout` — stores layout configuration: `layoutConfig`, `spacingConfig`, `personalConfig`, `selectedFont`, `sectionOrder`.

- The UI links content and layout by using the same document id for both collections. The linked id is stored locally under `resume_firestore_docId` so subsequent saves reuse the same documents.

Key helper functions are in `src/firebase/firestore.js`:
- `saveResumeContent(docId, content)` — set or create a resume content document and add server timestamps.
- `saveResumeLayout(docId, layout)` — set or create a layout document and add server timestamps.
- `getResumeContent(docId)` / `getResumeLayout(docId)` — read documents (with a small localStorage cache layer via `cacheGet`/`cacheSet`).

### Local drafts (instant local persistence)

- Local changes are saved instantly to localStorage as a compact draft payload so the user doesn't lose edits while offline or during navigation.
- Draft keys used:
	- `resume_draft_{docId}` when saving drafts associated with a Firestore doc id
	- `resume_draft_temp` when no doc id exists yet
- Draft payload contains sanitized `formData`, minimal `sections` (id, name, visible, items), a timestamp, and optionally the per-field edit timestamps tracked in `lastEditsRef`.

### Autosave & explicit save

- Autosave: UI changes are debounced (2–2.5s) and trigger `saveToFirestore({ skipConflictCheck: true })`. Autosave avoids prompting the user for conflicts while they are actively typing.
- Explicit Save (Save button): calls `saveToFirestore()` with conflict checks enabled. The save flow will attempt a lightweight remote signature check, attempt an automatic merge when possible, or prompt the user when merge is unsafe.

### Sanitization (important)

- Objects are sanitized before sending to Firestore to avoid saving unserializable values (functions, DOM nodes, undefined). This avoids Firestore errors such as `Unsupported field value: a function`. See the `sanitizeForFirestore` helper in `src/pages/Resume.jsx`.
- Do not store React components (eg. `section.icon`) directly in Firestore. Instead store identifiers (section ids) and hydrate client-side from `availableSections`.

### Caching

- `src/firebase/firestore.js` implements a small read cache using localStorage (`cacheSet`/`cacheGet`) with a default freshness window (5 minutes). This reduces repeated Firestore reads from the browser.

### Conflict detection & near-zero-conflict merge

- The app minimizes conflicts using:
	- Per-field edit timestamps (a Map `lastEditsRef`) that record when fields were edited locally.
	- A timestamp-aware three-way merge that prefers locally edited fields newer than the remote document's `updatedAt` when reconciling updates.
	- Autosave skips conflict checks to avoid interrupting users while typing.

If a merge cannot be safely performed (for example remote `updatedAt` missing or ambiguous structural changes), the app will show a conflict dialog and allow the user to overwrite or cancel.

### Local keys & quick references

- `resume_firestore_docId` — persistent doc id to reuse Firestore documents across sessions.
- `resume_draft_{docId}` / `resume_draft_temp` — instant local drafts.
- `resume_cache_content_{docId}`, `resume_cache_layout_{docId}` — local cache keys used by `cacheSet`/`cacheGet` in `src/firebase/firestore.js`.

### How to test persistence flows

1. Start the dev server:

```powershell
npm run dev
```

2. Open the app in two browser windows (A and B).
3. In A: make a local edit (e.g., change Full Name). Confirm the draft is saved to localStorage instantly.
4. In B: change a different field and click Save to persist to Firestore.
5. In A: click Save (explicit) or wait for autosave. The app will attempt an automatic merge or show the conflict dialog depending on the situation.
6. Inspect `resume_content` and `resume_layout` in the Firebase console to verify saved documents and server timestamps.

### Tips & next steps

- Add Firestore security rules to enforce that users can only access their own docs (based on `request.auth.uid`).
- Store `ownerUid` on documents for easy queries / admin operations.
- Add unit tests for the three-way merge helper to ensure deterministic merging across edge cases (concurrent delete+edit, simultaneous edits to the same field).
- Consider surface-level UI feedback when an automatic merge occurs (e.g., show a small badge or changelog) so users know what changed.

If you prefer this in a separate file, I can move these sections to `docs/persistence.md` and link it from `README.md`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
