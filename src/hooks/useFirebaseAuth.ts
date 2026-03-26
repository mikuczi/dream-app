import { useState, useEffect } from 'react'
import {
  auth, CONFIGURED,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult, fbSignOut,
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
    // Use redirect-only: Google's OAuth server sends COOP:same-origin which blocks
    // popup window polling regardless of our COOP header, causing ~40s timeouts.
    await signInWithRedirect(auth, provider)
  }

  async function signOut() {
    if (!auth) return
    await fbSignOut(auth)
  }

  return { fbUser, status, signIn, signOut, configured: CONFIGURED }
}
