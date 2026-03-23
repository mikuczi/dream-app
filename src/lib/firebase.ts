// ─────────────────────────────────────────────────────────
// Firebase config — paste your values from:
// Firebase Console → Project Settings → Your apps → Web app
// ─────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut, onAuthStateChanged, type User as FBUser } from 'firebase/auth'
import { getFirestore, doc, setDoc, collection, query, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FB_API_KEY            ?? '',
  authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN        ?? '',
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
  if (app) db = getFirestore(app)
} catch { /* Firestore not enabled — app runs in localStorage-only mode */ }

export { auth, db, CONFIGURED }
export type { FBUser }
export { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, fbSignOut, onAuthStateChanged }
export { doc, setDoc, collection, query, getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy }
