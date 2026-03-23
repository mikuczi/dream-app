import { useState, useEffect, useRef } from 'react'
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
  // Prevents treating the transient null auth state during redirect processing as signed-out
  const redirectChecked = useRef(false)

  useEffect(() => {
    if (!auth || !CONFIGURED) {
      setStatus('signed-out')
      return
    }

    // Must resolve getRedirectResult before we trust a null auth state.
    // Firebase emits onAuthStateChanged(null) before the redirect is processed,
    // which would incorrectly clear the session.
    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => {
        redirectChecked.current = true
        // If onAuthStateChanged already fired null and we suppressed it,
        // set signed-out now if there's still no user
        if (!auth!.currentUser) {
          setFbUser(null)
          setStatus('signed-out')
        }
      })

    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        setFbUser(user)
        setStatus('signed-in')
      } else if (redirectChecked.current) {
        // Only declare signed-out once we know the redirect has been checked
        setFbUser(null)
        setStatus('signed-out')
      }
      // else: redirect still in flight — keep 'loading' state
    })
    return unsub
  }, [])

  async function signIn() {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithRedirect(auth, provider)
  }

  async function signOut() {
    if (!auth) return
    await fbSignOut(auth)
  }

  return { fbUser, status, signIn, signOut, configured: CONFIGURED }
}
