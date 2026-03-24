# Speak with Dreams (reverie)

A dark-mode PWA for voice-recorded dream journaling with AI interpretation, social sharing, and pattern analysis.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, plain colocated CSS
- **Auth**: Firebase Authentication (Google OAuth, popup-first)
- **Database**: Firebase Firestore (per-user isolated subcollections)
- **Frontend Deploy**: Vercel — `speakwithdreams.vercel.app`
- **Backend Deploy**: Railway — WhatsApp webhook server (Express + Node)

## Project Structure

```
src/
  App.tsx                  — root state, navigation, auth, overlays
  styles/global.css        — ALL design tokens (colors, fonts, spacing)
  components/              — BottomBar, SideDrawer, DreamHalo, PhoneInput
  screens/                 — one .tsx + one .css per screen
  hooks/                   — useDreams, useFirebaseAuth, useSpeechRecognition
  lib/                     — firebase.ts (init), firestore.ts (all DB helpers)
  utils/                   — astro.ts, dreamConnections.ts, dreamConstellation.ts
  data/                    — badges.ts, symbols.ts, mockCommunity.ts
  types/dream.ts           — all TypeScript interfaces
backend/
  server.js                — WhatsApp Cloud API webhook (Express)
  firebase-admin.js        — Firestore server-side access
  db.js, analyze.js, transcribe.js, whatsapp.js
```

## Firestore Schema

```
users/{uid}                      — User profile
users/{uid}/dreams/{dreamId}     — Dreams (private by default)
users/{uid}/circles/{circleId}   — Dream circles
users/{uid}/chatHistory/{msgId}  — AI chat history
users/{uid}/patterns/{id}        — Recurring patterns
users/{uid}/symbols/{id}         — Recurring symbols
feed/{dreamId}                   — Denormalised public/circle posts
```

## Navigation

No React Router. Navigation is pure `useState`:
- `appState`: `'login' | 'onboarding' | 'app'`
- `activeView`: 17+ named views (journal, social, me, settings, ask, circle, ...)
- `overlay`: `'recording' | 'log' | 'settings' | 'whatsapp' | 'dreamdetail' | null`

## Local Storage Keys

| Key | Value |
|-----|-------|
| `dj_user` | User JSON |
| `dj_onboarded` | "1" |
| `dj_seen_badges` | badge ID array |
| `dj_checkin_date` | date string |
| `dj_daily_recordings` | `{ date, count }` — free tier limit |

## Design Rules

- **Dark mode only** — never add light styles
- **No hardcoded colors/sizes** — always use `var(--token)` from `global.css`
- **No React Router, no Tailwind, no CSS Modules**
- **Fade transitions only** — no horizontal slides
- Fonts: `Instrument Serif` (display/italic) + `Space Grotesk` (UI)

## Free Tier Limit

Free users can record **3 dreams per day**. Tracked in `dj_daily_recordings`.
After 3, the paywall (`DailyLimitPaywall`) is shown instead of the recorder.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
VITE_FB_API_KEY=
VITE_FB_AUTH_DOMAIN=        # must be projectid.firebaseapp.com (no trailing space/newline)
VITE_FB_PROJECT_ID=
VITE_FB_STORAGE_BUCKET=
VITE_FB_MESSAGING_SENDER_ID=
VITE_FB_APP_ID=
VITE_BACKEND_URL=           # Railway backend URL
```

> Common gotcha: a trailing newline in `VITE_FB_AUTH_DOMAIN` in Vercel env vars
> causes a `%0A` in the Firebase auth iframe URL and silently breaks sign-in.

## Dev Commands

```bash
npm run dev       # http://localhost:5173/
npm run build     # TypeScript check + Vite build (must stay clean)
npm run preview   # Preview production build
```

## Deployment

- Push to `main` → Vercel auto-deploys frontend
- Railway auto-deploys backend from the same repo (`backend/` subfolder)
- After changing env vars in Vercel, trigger a manual redeploy

## Firebase Setup

1. Firebase Console → Authentication → Sign-in method → enable Google
2. Authentication → Settings → Authorized domains → add `speakwithdreams.vercel.app`
3. Firestore → create database in production mode
