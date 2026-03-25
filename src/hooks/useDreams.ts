import { useState, useCallback, useEffect, useRef } from 'react'
import type { Dream } from '../types/dream'
import {
  saveDream as fsSave,
  deleteDream as fsDelete,
  subscribeDreams,
} from '../lib/firestore'

function localKey(uid: string) {
  return `dream-journal-dreams-${uid}`
}

function loadLocalForUser(uid: string): Dream[] {
  try {
    const raw = localStorage.getItem(localKey(uid))
    if (raw) {
      const parsed = JSON.parse(raw) as Dream[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return []
}

function saveLocalForUser(uid: string, dreams: Dream[]): void {
  localStorage.setItem(localKey(uid), JSON.stringify(dreams))
}

export function useDreams(uid?: string | null) {
  const [dreams, setDreams] = useState<Dream[]>([])
  const prevUid = useRef<string | null | undefined>(undefined)

  // ── Reset to the correct user's local cache on uid change ──
  useEffect(() => {
    if (prevUid.current === uid) return
    prevUid.current = uid
    if (uid) {
      setDreams(loadLocalForUser(uid))
    } else {
      setDreams([])
    }
  }, [uid])

  // ── Firestore real-time sync when signed in ──────────
  useEffect(() => {
    if (!uid) return
    // active flag prevents stale callbacks from a previous user's subscription
    // from overwriting the new user's data after sign-out/sign-in
    let active = true
    let hasReceivedData = false
    const unsub = subscribeDreams(uid, remoteDreams => {
      if (!active) return
      setDreams(remoteDreams)
      // Only overwrite localStorage once Firestore has confirmed non-empty data,
      // OR once it has confirmed the user genuinely has zero dreams (after first real fetch)
      if (remoteDreams.length > 0) {
        hasReceivedData = true
        saveLocalForUser(uid, remoteDreams)
      } else if (hasReceivedData) {
        // User deleted all their dreams — clear cache
        saveLocalForUser(uid, [])
      }
      // If remoteDreams is empty and we haven't received real data yet,
      // don't overwrite localStorage — Firestore may still be loading
    })
    return () => {
      active = false
      unsub()
    }
  }, [uid])

  const addDream = useCallback((dream: Dream) => {
    setDreams(prev => {
      const updated = [dream, ...prev]
      if (uid) saveLocalForUser(uid, updated)
      return updated
    })
    if (uid) fsSave(uid, dream).catch(console.error)
  }, [uid])

  const getDream = useCallback(
    (id: string): Dream | undefined => dreams.find(d => d.id === id),
    [dreams]
  )

  const updateDream = useCallback((id: string, partial: Partial<Dream>) => {
    setDreams(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...partial } : d)
      if (uid) {
        saveLocalForUser(uid, updated)
        const full = updated.find(d => d.id === id)
        if (full) fsSave(uid, full).catch(console.error)
      }
      return updated
    })
  }, [uid])

  const deleteDream = useCallback((id: string) => {
    setDreams(prev => {
      const updated = prev.filter(d => d.id !== id)
      if (uid) saveLocalForUser(uid, updated)
      return updated
    })
    if (uid) fsDelete(uid, id).catch(console.error)
  }, [uid])

  return { dreams, addDream, getDream, updateDream, deleteDream }
}
