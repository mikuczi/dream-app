// ─────────────────────────────────────────────────────────
// Firebase config — paste your values from:
// Firebase Console → Project Settings → Your apps → Web app
// ─────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut, onAuthStateChanged, type User as FBUser } from 'firebase/auth'
// signInWithPopup kept for potential future use
import { getFirestore, doc, setDoc, collection, query, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, where, limit, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

// Use the app's own hostname as authDomain in production to avoid Chrome's
// bounce-tracking mitigation (which deletes Firebase's auth state when it
// passes through dream-app-42fba.firebaseapp.com mid-redirect).
// Vercel proxies /__/auth/* → dream-app-42fba.firebaseapp.com/__/auth/*
// so Firebase redirect auth works entirely on speakwithdreams.vercel.app.
const authDomain = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  ? window.location.hostname
  : (import.meta.env.VITE_FB_AUTH_DOMAIN ?? '')

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY            ?? '',
  authDomain,
  projectId:         import.meta.env.VITE_FB_PROJECT_ID         ?? '',
  storageBucket:     import.meta.env.VITE_FB_STORAGE_BUCKET     ?? '',
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID ?? '',
  appId:             import.meta.env.VITE_FB_APP_ID             ?? '',
}

const CONFIGURED = Boolean(firebaseConfig.apiKey)

const app  = CONFIGURED ? initializeApp(firebaseConfig) : null
const auth = app ? getAuth(app) : null

// Firestore is optional — only initialised if the project has it enabled
let db: ReturnType<typeof getFirestore> | null = null
try {
  if (app) {
    db = getFirestore(app)
    console.log('[firebase] Firestore initialised ✓')
  }
} catch (err) {
  console.error('[firebase] Firestore failed to initialise — running localStorage-only:', err)
}

// FCM is optional — only available in secure contexts with a valid vapid key
let messaging: Messaging | null = null
try {
  if (app && 'serviceWorker' in navigator) messaging = getMessaging(app)
} catch { /* FCM not available */ }

const VAPID_KEY = import.meta.env.VITE_FB_VAPID_KEY ?? ''

export async function getFcmToken(): Promise<string | null> {
  if (!messaging || !VAPID_KEY) return null
  try {
    const sw = await navigator.serviceWorker.ready
    return await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw })
  } catch {
    return null
  }
}

export { onMessage }
export { auth, db, messaging, CONFIGURED }
export type { FBUser }
export { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, fbSignOut, onAuthStateChanged }
export { doc, setDoc, collection, query, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, where, limit, getDoc, updateDoc, increment, arrayUnion }
