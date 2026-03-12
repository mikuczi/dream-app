import { useState, useEffect } from 'react'
import {
  auth, CONFIGURED,
  GoogleAuthProvider, signInWithPopup, fbSignOut,
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
    const unsub = onAuthStateChanged(auth, user => {
      setFbUser(user ?? null)
      setStatus(user ? 'signed-in' : 'signed-out')
    })
    return unsub
  }, [])

  async function signIn() {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }

  async function signOut() {
    if (!auth) return
    await fbSignOut(auth)
  }

  return { fbUser, status, signIn, signOut, configured: CONFIGURED }
}
