# Taleem AI — Context Log

## Project Info
- **Repo**: `https://github.com/codewithsalty/Taleem-AI.git`
- **Author**: `codewithsalty` (`codewithsalty@gmail.com`)
- **Package**: `taleem-ai` (renamed from `nextn`)
- **Stack**: Next.js 15.3.8, TypeScript, Tailwind CSS, Firebase, Genkit, Groq
- **Branch**: `main` (merged from `master` with `--allow-unrelated-histories`)
- **Deploy target**: Vercel (Next.js auto-detection)

---

## 2026-07-18 Session

### Initial State (PREVIOUS SESSION ~03:52 AM)
- Initial commit with basic Taleem AI project structure
- Firebase client SDK setup in `src/firebase/`
- AI flows in `src/ai/flows/`
- Server actions in `src/lib/actions.ts`
- Firebase Admin SDK init in `src/firebase/server-init.ts`
- Firebase API key hardcoded in `src/firebase/config.ts`
- GitHub secret scanner triggered by committed API key

---

### Phase 1: Restructure & Security (04:08 — 04:13 AM)

**Commit**: `6681d2f` — "Restructure frontend/backend, fix imports, secure secrets"

#### 1.1 Folder Restructuring
```
OLD STRUCTURE                NEW STRUCTURE
src/ai/                      src/server/ai/
src/ai/flows/                src/server/ai/flows/
src/ai/groq.ts               src/server/ai/groq.ts
src/ai/genkit.ts             src/server/ai/genkit.ts
src/ai/retrieval.ts          src/server/ai/retrieval.ts
src/ai/dev.ts                src/server/ai/dev.ts
src/lib/actions.ts           src/server/actions.ts
src/firebase/server-init.ts  src/server/firebase/server-init.ts
```

15 flow files moved, 3 utility files moved, actions moved, server-init moved.

#### 1.2 Import Path Updates
Updated all `@/ai/...` → `@/server/ai/...` and `@/firebase/server-init` → `@/server/firebase/server-init` and `@/lib/actions` → `@/server/actions` in:
- `src/app/(dashboard)/ai-tutor/page.tsx`
- `src/app/(dashboard)/games/subject-sprint/page.tsx`
- `src/app/(dashboard)/notes-generator/page.tsx`
- `src/app/(dashboard)/past-papers/page.tsx`
- `src/app/(dashboard)/presentation-maker/page.tsx`
- `src/app/(dashboard)/study-suite/page.tsx`
- `src/app/(dashboard)/youtube-summarizer/page.tsx`
- `src/components/features/ai-tutor/ai-tutor.tsx`
- `src/components/features/flashcards/flashcard-form.tsx`
- `src/components/features/mind-map/mind-map-form.tsx`
- `src/components/features/notes-generator/notes-display.tsx`
- `src/components/features/notes-generator/notes-form.tsx`
- `src/components/features/quiz-generator/quiz-form.tsx`
- `src/components/features/study-suite/study-suite-output.tsx`
- `src/components/features/study-suite/upload-form.tsx`
- `src/components/features/voice-tutor/voice-tutor.tsx`
- `src/server/ai/flows/notes-generator-flow.ts`
- `src/server/ai/flows/rag-flow.ts`
- `src/server/ai/flows/video-to-text-flow.ts`
- `src/server/actions.ts`

#### 1.3 Bug: PowerShell Regex Corrupted Quotes
The import replacement script used PowerShell regex that changed opening `'` to `"` but left closing `'`, creating mismatched quotes like `from "@/server/ai/genkit'`. Fixed 20 files by replacing all `"@/...'` patterns with `"@/..."`.

#### 1.4 Relative Import Fixes in src/server/actions.ts
After moving to `src/server/actions.ts`, relative imports broke:
- `from './types'` → `from '@/lib/types'`
- `from './gamification'` → `from '@/lib/gamification'`

#### 1.5 Deleted Non-Essential Files
- `.agents/skills/developing-genkit-js/` (entire skill folder, 18 files)
- `docs/blueprint.md`
- `PITCH_DECK.md`
- `Taleem_AI_Design_Document.md`
- `metadata.json`
- `firebase-blueprint.json`

#### 1.6 Firebase API Key → Environment Variables
**Before** (`src/firebase/config.ts`):
```ts
export const firebaseConfig = {
  apiKey: "AIzaSyCj-urFfYXHJRNQfxsNbK4hD23-aT3JWCA",
  authDomain: "taleem-ai-b1ffb.firebaseapp.com",
  // ... hardcoded
};
```

**After**:
```ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  // ... from env
};
```

#### 1.7 .gitignore Updates
Added: `.env.local`, `.env.production`, `bun.lock`, `skills-lock.json`

#### 1.8 next.config.ts Cleanup
Removed: `ignoreBuildErrors` and `ignoreDuringBuilds` (were hiding real TS errors)

#### 1.9 Package.json Update
Renamed `name` from `nextn` → `taleem-ai`

#### 1.10 Dead Code Removal
- Deleted `.modified/` directory
- Deleted `auth/use-user.tsx` (unused hook)
- Deleted `rag-voice-flow.ts` (unused flow)
- Deleted `patches/` directory
- Deleted `src/lib/firebase/` (moved to `src/server/firebase/`)
- Deleted `bun.lock`, `skills-lock.json`
- Removed duplicate `dailyChallengeDefs` (now imported from `gamification.ts`)
- Removed unused `{ai}` import from 6 flow files
- Removed unused `googleAI` import from `notes-generator-flow.ts`

#### 1.11 Voice Tutor Fix
**Before**: `voice-tutor-flow.ts` used a hardcoded mock question string
**After**: Calls `transcribeAudio()` from `groq.ts` which uses Groq Whisper API for real transcription

#### 1.12 AI Tutor Fix
**Before**: `ai-tutor.tsx` used `simulatedTranscription` (fake speech-to-text)
**After**: Uses Web Speech API `SpeechRecognition` interface for real browser-based transcription

#### 1.13 Server-Side Firebase Rewrite
**Before**: `server-init.ts` imported both `firebase-admin` and client SDK packages
**After**: Uses `firebase-admin` only — no client SDK imports on server side

#### 1.14 Genkit Graceful Fallback
When `GOOGLE_GENAI_API_KEY` is not set, Genkit flows now return a helpful error message instead of crashing

#### 1.15 types.ts: Script Type Change
`AudioLessonSchema.script` changed from `string` to `Array<{ speaker: string, dialogue: string }>`
- `study-suite-output.tsx` updated to render the structured array

#### 1.16 Build Verification
- TypeScript passes with `tsc --noEmit`
- `next build` succeeds: 33 pages, 34 seconds, zero errors

---

### Phase 2: Cleanup & Resource Restore (04:13 — 04:16 AM)

**Commit**: `e83da3b` → REVERTED by `a085913`

#### 2.1 Deleted (then Reverted)
- `resources/` — 27 PNG screenshots (`1 (1).png` through `1 (27).png`)
  - **Deleted**: user was unhappy → **Restored** from git history (`git checkout HEAD~1 -- resources/`)
- `src/globals.css` — duplicate of `src/app/globals.css`, NOT reverted (confirmed unused)
- `apphosting.yaml` — Firebase-specific, NOT reverted (not needed for Vercel)
- `firestore.rules` — Firebase-specific, NOT reverted (not needed for Vercel)

**Result**: `resources/` restored, other deletions kept. Pushed as `a085913`

---

### Phase 3: Local Testing & Bug Fixes (04:30 — 05:40 AM)

**Commit**: `364c8a1` — "Final Commit"

#### 3.1 Video Player Fixes (`src/components/shared/video-player.tsx`)

**Empty poster fix**:
```tsx
// BEFORE — renders <img src=""> even when poster is empty
<img src={currentVideo.poster} ... />

// AFTER — conditionally hides img when poster is empty
{currentVideo.poster && (
  <img src={currentVideo.poster} ... />
)}
```

**Google Drive URL format change**:
- Before: `https://drive.usercontent.google.com/download?id=...&export=download&confirm=t`
- After: `https://drive.google.com/uc?export=download&id=...&confirm=t`
- Note: Google Drive streaming still unreliable regardless of format

Video IDs: `1eTnY4DXDgkiTBLfgS9mmHkihPfybzgb_` (English), `1RgVefW0W1hy5N-vbD_TqZJBJnKvIfcA0` (Urdu)

#### 3.2 Firebase Error Handling (`src/firebase/index.ts` + `src/firebase/provider.tsx`)

**Problem**: When `.env` vars are missing, `getAuth()` throws `auth/invalid-api-key`, crashing the entire app.

**Fix in `getSdks()`** (`src/firebase/index.ts:36-46`):
```ts
export function getSdks(firebaseApp: FirebaseApp) {
  let auth;
  let firestore;
  try {
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } catch {
    return { firebaseApp, auth: null, firestore: null };
  }
  return { firebaseApp, auth, firestore };
}
```

**Fix in `FirebaseProviderProps`** (`src/firebase/provider.tsx`):
```ts
// BEFORE — required non-null
interface FirebaseProviderProps {
  firestore: Firestore;
  auth: Auth;
}

// AFTER — accepts null
interface FirebaseProviderProps {
  firestore: Firestore | null;
  auth: Auth | null;
}
```

Note: `useFirebase()` still throws if services aren't available — pages using Firebase Auth (signup/login) will error until env vars are configured.

#### 3.3 Removed Turbopack Flag
`package.json` dev script changed from:
- `next dev --turbopack -p 3000` → Turbopack caused "unexpected error" at runtime
- Now runs with: `next dev -p 3000` (plain Webpack)

Actually, the `package.json` still has `--turbopack`. The fix was to run without it manually. Should update `package.json` to remove `--turbopack`.

#### 3.4 Created .env File
File: `.env` (gitignored, won't be committed)
Contains:
- Firebase web SDK config (from original `config.ts` values)
- `GROQ_API_KEY` = (set locally, not committed)
- `FIREBASE_SERVICE_ACCOUNT_KEY` = JSON (from `studio-6147701984-fafcf` project)
- `GOOGLE_GENAI_API_KEY` = (not set yet)

#### 3.5 Local Dev Server Test Results
- `localhost:3000/` (homepage) → **200 OK** (works)
- `localhost:3000/signup` → **200 OK** (with Firebase configured)
- `localhost:3000/login` → **200 OK**
- `localhost:3000/favicon.ico` → **200 OK**
- `/logo.png` → **404** (not in source code, likely browser extension)
- `/icon-192x192.png` → **404** (PWA manifest references icons not in `public/`)
- Google sign-in → `redirect_uri_mismatch` (need to add localhost to Firebase Auth domains)
- Demo videos → "Video unavailable" (Google Drive streaming blocked/not public)

---

### Phase 4: Deployment Prep (~05:40 AM)

#### 4.1 Final Commit Pushed
- `364c8a1` pushed to `origin main`
- Repo clean: `git status` shows no unstaged/modified files

#### 4.2 Vercel Deploy Steps
1. Import repo at vercel.com
2. Auto-detects Next.js — no config changes needed
3. Add these env vars in Vercel Dashboard → Settings → Environment Variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GROQ_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (optional, for Admin SDK)
   - `GOOGLE_GENAI_API_KEY` (optional, for Genkit)
4. After deploy: add Vercel domain to Firebase Auth authorized domains

#### 4.3 Firebase Note
- Web client project: `taleem-ai-b1ffb`
- Service account project: `studio-6147701984-fafcf`
- These are DIFFERENT Firebase projects — if Admin SDK needs to access same Firestore/Auth as web app, generate a service account key from `taleem-ai-b1ffb` instead

---

## Current Project Structure (Final)

```
taleem-ai/
├── .env                  # Local env vars (gitignored)
├── .env.example          # Template for env vars
├── .gitignore
├── README.md
├── components.json       # ShadCN config
├── context.md            # This file
├── next.config.ts        # Next.js config (image domains, webpack fallbacks)
├── package.json          # Dependencies & scripts
├── package-lock.json
├── postcss.config.mjs    # PostCSS for Tailwind
├── tailwind.config.ts    # Tailwind theme (colors, fonts, animations)
├── tsconfig.json         # TS config with @/ path alias
│
├── public/
│   └── manifest.json     # PWA manifest (icons missing)
│
├── resources/            # 27 screenshots for README
│   ├── 1 (1).png — 1 (27).png
│
└── src/
    ├── app/                          # Next.js App Router pages
    │   ├── (dashboard)/              # Authenticated routes
    │   │   ├── ai-tutor/
    │   │   ├── dashboard/
    │   │   ├── flashcards/
    │   │   ├── games/                # 6 educational games
    │   │   ├── mind-map/
    │   │   ├── notes-generator/
    │   │   ├── past-papers/
    │   │   ├── presentation-maker/
    │   │   ├── quiz-generator/
    │   │   ├── settings/
    │   │   ├── study-suite/
    │   │   ├── voice-tutor/
    │   │   └── youtube-summarizer/
    │   ├── about/
    │   ├── docs/
    │   ├── login/
    │   ├── news/
    │   ├── signup/
    │   ├── parent/
    │   ├── globals.css
    │   ├── layout.tsx               # Root layout (Firebase, Theme, Splash)
    │   └── page.tsx                  # Landing page
    │
    ├── components/
    │   ├── features/                # Feature components
    │   │   ├── ai-tutor/
    │   │   ├── flashcards/
    │   │   ├── gamification/        # 9 gamification components
    │   │   ├── mind-map/
    │   │   ├── notes-generator/
    │   │   ├── presentation-maker/
    │   │   ├── quiz-generator/
    │   │   ├── study-suite/
    │   │   └── voice-tutor/
    │   ├── shared/                  # 20 shared components
    │   │   ├── auth-header.tsx
    │   │   ├── dashboard-header.tsx
    │   │   ├── footer.tsx
    │   │   ├── logo.tsx             # SVG logo (not PNG)
    │   │   ├── public-header.tsx
    │   │   ├── splash-screen.tsx
    │   │   ├── video-player.tsx
    │   │   └── ...
    │   ├── ui/                      # 34 ShadCN UI components
    │   └── FirebaseErrorListener.tsx
    │
    ├── context/
    │   └── language-context.tsx
    │
    ├── firebase/                    # Client-side Firebase
    │   ├── config.ts                # Reads from env vars
    │   ├── index.ts                 # init + getSdks (with try-catch)
    │   ├── provider.tsx             # FirebaseProvider + useFirebase hook
    │   ├── client-provider.tsx
    │   ├── errors.ts
    │   ├── error-emitter.ts
    │   ├── firestore/               # Firestore hooks
    │   ├── non-blocking-login.tsx
    │   └── non-blocking-updates.tsx
    │
    ├── hooks/
    │   ├── use-mobile.tsx
    │   ├── use-toast.ts
    │   └── use-translation.ts
    │
    ├── lib/                         # Shared utilities
    │   ├── gamification.ts
    │   ├── maps/
    │   ├── placeholder-images.json
    │   ├── placeholder-images.ts
    │   ├── translations.ts
    │   ├── types.ts
    │   └── utils.ts
    │
    └── server/                      # Server-only code
        ├── actions.ts               # Server Actions (25+ actions)
        ├── ai/
        │   ├── groq.ts              # Groq API client + Whisper
        │   ├── genkit.ts            # Genkit AI setup (graceful fallback)
        │   ├── retrieval.ts         # RAG retrieval
        │   ├── dev.ts
        │   └── flows/               # 15 AI flows
        │       ├── ai-quiz-generator.ts
        │       ├── ai-tutor-flow.ts
        │       ├── document-processor-flow.ts
        │       ├── embedding-flow.ts
        │       ├── identify-important-questions-flow.ts
        │       ├── mind-map-generator.ts
        │       ├── notes-generator-flow.ts
        │       ├── past-paper-analyzer-flow.ts
        │       ├── presentation-generator-flow.ts
        │       ├── rag-flow.ts
        │       ├── smart-flashcard-generation.ts
        │       ├── smart-study-suite-flow.ts
        │       ├── video-to-text-flow.ts
        │       ├── voice-tutor-flow.ts
        │       └── youtube-summarizer-flow.ts
        └── firebase/
            └── server-init.ts        # Firebase Admin SDK init
```

---

## Remaining Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Google Drive videos won't stream | Medium | Upload to YouTube unlisted or Firebase Storage, update URLs in `video-player.tsx` |
| 2 | `/logo.png` 404 | Low | Not in source code — likely browser extension. Create a placeholder or ignore |
| 3 | `/icon-192x192.png` + `/icon-512x512.png` 404 | Low | Add real icon PNGs to `public/` matching `manifest.json` |
| 4 | `redirect_uri_mismatch` on Google sign-in | High | Add domain to Firebase Auth → Settings → Authorized domains |
| 5 | `GOOGLE_GENAI_API_KEY` not set | Low | Get free key from https://aistudio.google.com/apikey |
| 6 | Service account on wrong project | Medium | Generate key from `taleem-ai-b1ffb` (not `studio-6147701984-fafcf`) for Admin SDK |
| 7 | Turbopack still in `package.json` dev script | Low | Remove `--turbopack` flag to avoid conflicts with Webpack config |
