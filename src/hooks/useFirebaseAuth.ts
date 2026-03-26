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

export function useFirebaseAuth(): FirebaseAuthState {
  const [fbUser, setFbUser] = useState<FBUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    if (!auth || !CONFIGURED) {
      setStatus('signed-out')
      return
    }

    // getRedirectResult must resolve before we trust onAuthStateChanged('signed-out'),
    // otherwise the login screen flashes briefly on redirect return.
    let redirectResolved = false

    getRedirectResult(auth)
      .then(() => { redirectResolved = true })
      .catch(err => {
        console.error('[auth] getRedirectResult error:', err)
        redirectResolved = true
      })

    const unsub = onAuthStateChanged(auth, user => {
      if (!redirectResolved && !user) return // wait for redirect result first
      setFbUser(user ?? null)
      setStatus(user ? 'signed-in' : 'signed-out')
    })
    return unsub
  }, [])

  async function signIn() {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    // Strategy: popup first (no redirect chain = no bounce-tracking issues).
    // Firebase v10+ uses BroadcastChannel for popup messaging, so COOP on
    // Google's server no longer causes 40s hangs.
    // If the popup is blocked or fails for any reason, fall back to redirect.
    try {
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      const code = err?.code ?? ''
      // popup-blocked: browser blocked the window — fall through to redirect
      // cancelled-popup-request: user clicked sign-in twice — ignore silently
      // popup-closed-by-user: user closed it — don't redirect, let them retry
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return
      }
      // For any other error (popup blocked, network, COOP timeout, etc.) — use redirect
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
