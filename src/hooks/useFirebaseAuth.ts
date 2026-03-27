import { useState, useEffect } from 'react'
import {
  auth, CONFIGURED,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, fbSignOut,
  onAuthStateChanged, type FBUser,
} from '../lib/firebase'

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out'

export interface FirebaseAuthState {
  fbUser:   FBUser | null
  status:   AuthStatus
  signIn:   () => Promise<void>
  signOut:  () => Promise<void>
  configured: boolean
}

// True when running as an installed PWA (standalone display mode) or on
// a touch-only mobile device. In these contexts popups are blocked or
// unreliable — redirect is the only option.
function shouldUseRedirect(): boolean {
  if (typeof window === 'undefined') return false
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  return standalone || mobile
}

export function useFirebaseAuth(): FirebaseAuthState {
  const [fbUser, setFbUser] = useState<FBUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    if (!auth || !CONFIGURED) {
      setStatus('signed-out')
      return
    }

    // We need getRedirectResult to resolve before trusting a null from
    // onAuthStateChanged — otherwise the login screen flashes on redirect return.
    //
    // BUG FIXED: if onAuthStateChanged(null) fires first (before getRedirectResult
    // resolves) we skip it. But then getRedirectResult returns null (no pending
    // redirect) and sets redirectResolved = true — onAuthStateChanged will never
    // fire again, leaving the app stuck in 'loading' forever.
    //
    // Fix: after getRedirectResult resolves, always apply auth.currentUser so
    // we never get stuck regardless of which callback won the race.
    let redirectResolved = false

    function applyUser(user: FBUser | null) {
      setFbUser(user)
      setStatus(user ? 'signed-in' : 'signed-out')
    }

    getRedirectResult(auth)
      .then(result => {
        redirectResolved = true
        // If there was no redirect result, onAuthStateChanged(null) was already
        // skipped by our guard — apply current auth state now so we don't hang.
        if (!result) applyUser(auth!.currentUser)
      })
      .catch(err => {
        console.error('[auth] getRedirectResult error:', err)
        redirectResolved = true
        applyUser(auth!.currentUser)
      })

    const unsub = onAuthStateChanged(auth, user => {
      if (!redirectResolved && !user) return // wait for redirect result first
      applyUser(user ?? null)
    })
    return unsub
  }, [])

  async function signIn() {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    // On mobile / installed PWA, popups are blocked — go straight to redirect.
    if (shouldUseRedirect()) {
      await signInWithRedirect(auth, provider)
      return
    }

    // Desktop: popup first (no redirect chain, no bounce-tracking risk).
    // Firebase v12 uses BroadcastChannel for popup messaging so Google's
    // COOP:same-origin no longer causes 40s polling hangs.
    // Fallback to redirect if the popup is blocked or hits any unexpected error.
    try {
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      const code = err?.code ?? ''
      // User deliberately closed the popup — let them retry, don't redirect.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return
      }
      console.warn('[auth] popup failed, falling back to redirect:', code)
      await signInWithRedirect(auth, provider)
    }
  }

  async function signOut() {
    if (!auth) return
    await fbSignOut(auth)
  }

  return { fbUser, status, signIn, signOut, configured: CONFIGURED }
}
