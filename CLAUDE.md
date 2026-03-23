# Dream Journal – Claude Code Rules

This is a React 18 + TypeScript PWA — a dark-mode dream journaling app with voice recording, AI interpretation, social features, and badge system.
Deployment: Netlify at `speakwithdreams.netlify.app`.

---

## Project Structure

```
src/
  App.tsx                    — root, state management, navigation
  styles/
    global.css               — SINGLE SOURCE OF TRUTH for all design tokens + global styles
  components/                — reusable UI primitives
    BottomBar.tsx/css        — 5-tab bottom navigation
    SideDrawer.tsx/css       — left slide-out menu (all screens)
    DreamHalo.tsx            — canvas-based animated recording orb
    PhoneInput.tsx/css       — phone number input
  screens/                   — one file + one CSS file per screen
  hooks/                     — useDreams, useFirebaseAuth, useSpeechRecognition
  lib/                       — firebase.ts, firestore.ts
  utils/                     — astro.ts, dreamConnections.ts, dreamConstellation.ts
  data/                      — badges.ts, symbols.ts, mockCommunity.ts
  types/
    dream.ts                 — all TypeScript interfaces
public/
  icons/                     — PWA icons
  photos/                    — image assets
  sw.js                      — service worker
```

---

## Design Tokens

**IMPORTANT: Never hardcode any color, size, spacing, shadow, radius, or typography value.**
All tokens are CSS custom properties defined in `src/styles/global.css`.

### Colors

```css
/* Backgrounds */
--bg: #080808                               /* app background (almost black) */
--bg-elevated: #111111                      /* cards, modals */
--bg-card: #141414                          /* card background */

/* Text */
--text-primary: #f0f0f0                     /* main text */
--text-secondary: #888                      /* secondary / muted */
--text-tertiary: #444                       /* hint / disabled */

/* Borders */
--border: rgba(255, 255, 255, 0.07)         /* default subtle border */
--border-strong: rgba(255, 255, 255, 0.14)  /* stronger border */
```

This is a **dark-mode-only** app. No light mode. No arbitrary hex values.

### Typography

```css
--font-display: 'Instrument Serif', Georgia, serif   /* dream titles, headings */
--font-ui: 'Space Grotesk', system-ui, sans-serif    /* body text, labels, UI */
```

**Usage pattern:**
- Dream titles: `font-family: var(--font-display); font-style: italic;`
- Section headers: `font-family: var(--font-display); font-size: 22px; font-style: italic;`
- Body / UI: `font-family: var(--font-ui);` with weights 300/400/500/600
- Labels: `font-family: var(--font-ui); font-size: 10–12px; text-transform: uppercase; letter-spacing: 0.04–0.12em;`

### Spacing & Layout

```css
--screen-max: 390px           /* max viewport width */
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--tab-bar-height: 64px        /* bottom nav height */
--safe-area-top: env(safe-area-inset-top, 0px)
--safe-area-bottom: env(safe-area-inset-bottom, 0px)
```

---

## Navigation & State

There is **no React Router**. Navigation is `useState` only.

- `appState`: `'login' | 'onboarding' | 'app'`
- `activeView`: 17+ named views (journal, gallery, symbols, characters, places, collections, insights, ask, digest, dashboard, library, bookmarks, drafts, social, circle, constellation, me, search, settings, whatsapp)
- `overlay`: `'recording' | 'log' | 'settings' | 'whatsapp' | 'dreamdetail' | null`

**Tab bar** (BottomBar.tsx) — 5 items: Menu (opens SideDrawer), Social, Record (center), Journal, Profile
**Side drawer** (SideDrawer.tsx) — slide-in from left, lists all screens

---

## Screen Layout Patterns

### Tab screen (main views)
```jsx
<div className="screen">
  {/* no header — SideDrawer handles nav */}
  <div className="tab-content">
    {/* scrollable content */}
  </div>
</div>
```

### Overlay screen (slides over current view)
```jsx
<div className="overlay-screen screen-enter">
  {/* full-screen content */}
</div>
```

### Bottom sheet (modal)
```jsx
<div className="app-checkin-overlay" onClick={onClose} />
<div className="app-checkin-sheet">
  {/* bottom sheet content */}
</div>
```

CSS key: sheets use `animation: slideUp 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)` and `border-radius: 24px 24px 0 0`.

---

## Animations

Use these **only** — do not invent new keyframes:

| Name | Duration | Usage |
|------|----------|-------|
| `screenFadeIn` | 0.15s ease | Overlay screens appearing |
| `slideUp` | 0.32s cubic-bezier | Bottom sheets |
| `toggle` | 0.2s cubic-bezier(0.34,1.56,0.64,1) | Spring/toggle effects |
| `badgeToastIn` | 0.35s cubic-bezier(0.34,1.56,0.64,1) | Badge unlock toast |
| `pulseDot` | 1.4s ease-in-out infinite | Recording status dots |
| `notifPanelIn` | 0.18s ease | Notification dropdown |
| `saveToastIn` | 0.25s ease | Save confirmation toast |

**Transitions are fade-based only** — no horizontal slides (unlike fedi-web).

---

## Styling Approach

- **Plain CSS colocated with each component/screen** — `Screen.tsx` imports `Screen.css`
- **No CSS Modules, no Tailwind, no styled-components**
- BEM-ish naming: `.screen-name__element--modifier`
- Global utility classes in `global.css`: `.screen`, `.overlay-screen`, `.tab-content`, `.screen-enter`

---

## Component Library

All reusable components are in `src/components/`. Check before creating new ones.

| Component | File | Purpose |
|-----------|------|---------|
| `BottomBar` | `BottomBar.tsx` | 5-tab bottom navigation |
| `SideDrawer` | `SideDrawer.tsx` | Left slide-out full-screen nav |
| `DreamHalo` | `DreamHalo.tsx` | Canvas-based animated recording orb (5 concentric rings, breathing, ripple) |
| `PhoneInput` | `PhoneInput.tsx` | Phone number input with country code |

---

## Core Data Types

```typescript
// src/types/dream.ts
interface Dream {
  id: string
  createdAt: string                  // ISO date
  title: string
  transcript: string                 // voice-to-text output
  notes?: string
  artwork?: string                   // URL or CSS gradient
  mood: 'peaceful' | 'joyful' | 'anxious' | 'scary' | 'strange'
  lucid: boolean
  clarity: 1 | 2 | 3 | 4 | 5
  recurring: boolean
  tags: string[]
  sleepQuality: 1 | 2 | 3 | 4 | 5
  visibility?: 'private' | 'circle' | 'public'
  bookmarked?: boolean
}

interface User {
  id: string
  name: string
  email: string
  dob: string                        // ISO date
  zodiacSign: ZodiacSign
  photoURL?: string
  createdAt: string
}
```

---

## Persistent State (localStorage)

| Key | Content |
|-----|---------|
| `dj_user` | User object JSON |
| `dj_onboarded` | boolean |
| `dj_seen_badges` | badge ID array |
| `dj_checkin_date` | date string |
| `dj_notif_enabled` | boolean |
| `dj_notif_time` | time string |
| `dj_notif_last` | date string |
| `dream-journal-dreams` | Dream array (fallback) |

---

## App Features Overview

### Voice Recording
- `RecordingScreen` + `DreamHalo` canvas orb (teal/cyan gradient, breathing animation)
- Web Speech API via `useSpeechRecognition` hook
- Live transcript overlay, word counter, "Save Dream" button

### Dream Management
- `JournalScreen`: 7-day date strip, calendar toggle, dream cards with mood/clarity/privacy icons, filter chips (All/Lucid/Recurring)
- `DreamDetailScreen`: full text, visibility selector, bookmark, share, comments
- `LogScreen`: edit title, mood, clarity, tags after recording

### Analysis & Discovery
- `InsightsScreen`: mood trends, moon phase correlation
- `DreamConstellationScreen`: 3D star map visualization of dreams
- `AskDreamsScreen`: Q&A about your dream history
- `MySymbolsScreen`, `MyCharactersScreen`, `MyPlacesScreen`: recurring entities
- `DashboardScreen`: dream KPIs + stats

### Social
- `SocialScreen`: dream circle + Instagram-style stories
- `DreamCircleScreen`: manage circle members (close friends)
- `StoryViewer`: full-screen swipe story viewer

### Gamification
- `data/badges.ts`: 11 unlockable badge achievements
- Badge toast appears top-center (`rgba(30, 20, 50, 0.92)` background) with spring animation
- Profile screen (`MeScreen`) shows badge grid + paywall CTA

### Paywall
- `PaywallScreen`: dual-tier (Premium + AI subscription)
- Purple accent color for premium features

---

## Special UI Elements

**Toggle switch** (global.css):
- Track: `44px × 26px`, border-radius 13px
- Thumb: `20px × 20px`, transitions with spring easing `cubic-bezier(0.34,1.56,0.64,1)`

**Notification panel** (App.tsx):
- Bell icon top-right, z-index 110
- Red dot for unread: `background: #e05a6b`
- Dropdown with "Clear all"

**Morning check-in modal**:
- Appears 6am–11am once per day
- "Did you dream last night?" + Yes/Not today
- 1.2s delay after app load

**Save toast**:
- Frosted glass: `backdrop-filter: blur(...)`, border
- "Dream saved & added to your story ✓"
- Appears above bottom bar

---

## Build

```bash
npm run dev      # http://localhost:5173/
npm run build    # TypeScript compile + Vite build (must stay clean)
npm run preview  # Preview production build
```

**Backend:** Firebase (Firestore + Auth) — env vars in `.env.local`
**No Figma integration** — this app is NOT connected to Figma (unlike fedi-web)

---

## Rules

1. **Dark mode only** — never add light mode styles or white/light backgrounds
2. **No hardcoded values** — always use `var(--token)` from `global.css`
3. **No new fonts** — only `Instrument Serif` (display) and `Space Grotesk` (UI)
4. **Colocated CSS** — every new component/screen gets its own `.css` file
5. **TypeScript** — this project uses `.tsx`/`.ts`, not `.jsx`/`.js`
6. **Fade transitions only** — no horizontal slide animations
7. **Check `src/components/` first** before creating a new component
8. **New screens go in SettingsScreen** — new educational/settings flows need a row in `SettingsScreen.tsx`
