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
    // Pick up any result from a redirect-fallback sign-in
    getRedirectResult(auth).catch(() => {})

    const unsub = onAuthStateChanged(auth, user => {
      setFbUser(user ?? null)
      setStatus(user ? 'signed-in' : 'signed-out')
    })
    return unsub
  }, [])

  async function signIn() {
    if (!auth) {
      console.error('[Auth] auth is null — Firebase env vars not loaded')
      return
    }
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      console.error('[Auth] signInWithPopup error:', err?.code, err?.message)
      if (err?.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider)
      }
      // auth/popup-closed-by-user — user dismissed, do nothing
    }
  }

  async function signOut() {
    if (!auth) return
    await fbSignOut(auth)
  }

  return { fbUser, status, signIn, signOut, configured: CONFIGURED }
}
